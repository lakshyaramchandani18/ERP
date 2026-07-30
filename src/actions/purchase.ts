"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPurchaseInvoice(payload: any) {
  const { supplierId, invoiceNumber, items, subTotal, totalTax, grandTotal, amountPaid } = payload;

  if (!items || items.length === 0) {
    return { error: "Invoice must have items" };
  }
  if (!supplierId || !invoiceNumber) {
    return { error: "Supplier and Invoice Number are required" };
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Generate internal tracking number
      const systemInvNumber = `PI-${Date.now()}`;

      // 2. Create Purchase Invoice
      const invoice = await tx.purchaseInvoice.create({
        data: {
          invoiceNumber,
          systemInvNumber,
          supplierId,
          invoiceDate: new Date(),
          subTotal,
          totalTax,
          grandTotal,
          paymentStatus: amountPaid >= grandTotal ? "PAID" : amountPaid > 0 ? "PARTIAL" : "UNPAID",
          items: {
            create: items.map((item: any) => ({
              variantId: item.variantId,
              quantity: item.qty,
              unitPrice: item.price,
              taxPercent: item.taxPercent || 0,
              taxAmount: (item.price * (item.taxPercent || 0)) / 100 * item.qty,
              total: item.price * item.qty,
            })),
          },
        },
      });

      // 3. Update Inventory Stock (Increase)
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              increment: item.qty,
            },
          },
        });
      }

      // 4. Ledger Entries
      // Debit Inventory/Expense Account
      await tx.ledgerEntry.create({
        data: {
          type: "DEBIT",
          amount: grandTotal,
          referenceType: "PURCHASE_INVOICE",
          referenceId: invoice.id,
          remarks: `Purchase Invoice ${invoiceNumber}`,
          supplierId,
        },
      });

      // If we paid anything immediately, credit the supplier
      if (amountPaid > 0) {
        await tx.ledgerEntry.create({
          data: {
            type: "CREDIT",
            amount: amountPaid,
            referenceType: "PAYMENT_VOUCHER",
            referenceId: invoice.id,
            remarks: `Payment for Purchase Invoice ${invoiceNumber}`,
            supplierId,
          },
        });
      }

      return invoice;
    });

    revalidatePath("/dashboard/purchases/invoices");
    return { success: true, systemInvNumber: result.systemInvNumber };
  } catch (error: any) {
    console.error("Purchase Invoice creation failed:", error);
    return { error: error.message || "Failed to process purchase invoice" };
  }
}
