"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSaleOrder(payload: any) {
  const {
    cart,
    items: payloadItems,
    customerId,
    subTotal,
    totalTax,
    grandTotal,
    paymentMethod,
    paymentMode, // "PAY_PRINT" | "FULL_UDHAAR" | "SPLIT_UDHAAR"
    amountPaid: rawAmountPaid,
    udhaarDueDate,
    notes,
  } = payload;

  const items = payloadItems || cart || [];

  if (!items || items.length === 0) {
    return { error: "Cart is empty" };
  }

  let finalAmountPaid = rawAmountPaid || 0;

  if (paymentMode === "FULL_UDHAAR") {
    finalAmountPaid = 0;
  } else if (paymentMode === "SPLIT_UDHAAR") {
    finalAmountPaid = rawAmountPaid || 0;
  } else if (paymentMode === "PAY_PRINT" && !rawAmountPaid) {
    finalAmountPaid = grandTotal;
  }

  if ((paymentMode === "FULL_UDHAAR" || paymentMode === "SPLIT_UDHAAR") && !customerId) {
    return { error: "Customer selection is required for Udhaar billing." };
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Fetch a default branch
      let branch = await tx.branch.findFirst();
      if (!branch) {
        branch = await tx.branch.create({
          data: { name: "Main Store", code: "MAIN" },
        });
      }

      // 2. Generate a unique Invoice Number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const amountDue = Math.max(0, grandTotal - finalAmountPaid);
      const paymentStatus =
        finalAmountPaid >= grandTotal
          ? "PAID"
          : finalAmountPaid > 0
          ? "PARTIAL"
          : "UNPAID";

      // 3. Create Sale Order
      const saleOrder = await tx.saleOrder.create({
        data: {
          invoiceNumber,
          customerId: customerId || null,
          branchId: branch.id,
          subTotal,
          totalTax,
          totalDiscount: payload.totalDiscount || 0,
          grandTotal,
          paymentMethod: paymentMethod || "CASH",
          amountPaid: finalAmountPaid,
          amountDue,
          paymentStatus,
          items: {
            create: items.map((item: any) => ({
              variantId: item.variantId,
              quantity: item.quantity || item.qty || 1,
              unitPrice: item.sellingPrice || item.unitPrice || item.price || 0,
              cogs: item.cogs || 0,
              mrp: item.mrp || item.sellingPrice || item.price || 0,
              taxPercent: item.taxPercent || 0,
              taxAmount:
                (((item.sellingPrice || item.price || 0) * (item.taxPercent || 0)) / 100) *
                (item.quantity || item.qty || 1),
              total: item.total || (item.sellingPrice || item.price || 0) * (item.quantity || item.qty || 1),
            })),
          },
        },
      });

      // 4. Update Inventory Stock
      for (const item of items) {
        const qty = item.quantity || item.qty || 1;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: qty,
            },
          },
        });
      }

      // 5. Customer Visit Tracking & Loyalty Update
      if (customerId) {
        const cust = await tx.customer.findUnique({ where: { id: customerId } });
        const now = new Date();
        if (cust) {
          await tx.customer.update({
            where: { id: customerId },
            data: {
              visitCount: { increment: 1 },
              lastVisitDate: now,
              firstVisitDate: cust.firstVisitDate || now,
            },
          });

          await tx.customerVisit.create({
            data: {
              customerId,
              saleOrderId: saleOrder.id,
              visitDate: now,
              amountSpent: grandTotal,
            },
          });
        }
      }

      // 6. Handle Udhaar Creation if Credit / Split Payment
      if ((paymentMode === "FULL_UDHAAR" || paymentMode === "SPLIT_UDHAAR" || amountDue > 0) && customerId) {
        let due: Date;
        if (udhaarDueDate) {
          due = new Date(udhaarDueDate);
        } else {
          due = new Date();
          due.setDate(due.getDate() + 30);
        }

        const udhaarEntry = await tx.udhaarEntry.create({
          data: {
            customerId,
            saleOrderId: saleOrder.id,
            billNumber: invoiceNumber,
            totalAmount: grandTotal,
            paidAmount: finalAmountPaid,
            remainingAmount: amountDue,
            dueDate: due,
            status: amountDue === 0 ? "PAID" : due < new Date() ? "OVERDUE" : "PENDING",
            notes: notes || `POS Credit Sale Invoice ${invoiceNumber}`,
          },
        });

        if (finalAmountPaid > 0) {
          await tx.udhaarPayment.create({
            data: {
              udhaarId: udhaarEntry.id,
              customerId,
              amount: finalAmountPaid,
              paymentMethod: paymentMethod || "CASH",
              notes: `Split payment at POS checkout for ${invoiceNumber}`,
            },
          });
        }

        if (amountDue > 0) {
          await tx.customer.update({
            where: { id: customerId },
            data: { outstanding: { increment: amountDue } },
          });
        }
      }

      // 7. General Ledger Entries
      await tx.ledgerEntry.create({
        data: {
          type: "CREDIT",
          amount: grandTotal,
          referenceType: "INVOICE",
          referenceId: saleOrder.id,
          remarks: `Sales Invoice ${invoiceNumber}`,
          customerId: customerId || null,
        },
      });

      if (finalAmountPaid > 0 && customerId) {
        await tx.ledgerEntry.create({
          data: {
            type: "DEBIT",
            amount: finalAmountPaid,
            referenceType: "PAYMENT_RECEIPT",
            referenceId: saleOrder.id,
            remarks: `Payment for ${invoiceNumber}`,
            customerId,
          },
        });
      }

      return saleOrder;
    });

    const { recalculateAccountingSummary } = await import("./accounting-summary");
    await recalculateAccountingSummary();

    revalidatePath("/dashboard/sales/history");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/udhaar");
    revalidatePath("/dashboard/accounting");
    return { success: true, invoiceNumber: result.invoiceNumber, saleOrder: result };
  } catch (error: any) {
    console.error("Sale order creation failed:", error);
    return { error: error.message || "Failed to process sale" };
  }
}
