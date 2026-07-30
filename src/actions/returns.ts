"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSaleReturns() {
  try {
    const returns = await prisma.saleReturn.findMany({
      include: {
        customer: true,
        saleOrder: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
                color: true,
                size: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });
    return { success: true, returns };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSaleReturn(data: {
  customerId?: string;
  saleOrderId?: string;
  returnType: "REFUND" | "EXCHANGE" | "STORE_CREDIT";
  refundAmount?: number;
  reason?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
  }>;
}) {
  try {
    if (data.items.length === 0) {
      return { success: false, error: "Return items are required." };
    }

    const returnNumber = `SR-${Date.now().toString().slice(-6)}`;
    let totalAmount = 0;

    const formattedItems = data.items.map((i) => {
      const itemTotal = i.quantity * i.unitPrice;
      totalAmount += itemTotal;
      return {
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalAmount: itemTotal,
      };
    });

    const refundAmount = data.refundAmount !== undefined ? data.refundAmount : totalAmount;

    // 1. Create SaleReturn & Items
    const saleReturn = await prisma.saleReturn.create({
      data: {
        returnNumber,
        saleOrderId: data.saleOrderId || null,
        customerId: data.customerId || null,
        totalAmount,
        refundAmount,
        returnType: data.returnType || "REFUND",
        reason: data.reason || "Customer return / size exchange",
        status: "COMPLETED",
        items: {
          create: formattedItems,
        },
      },
      include: { items: true },
    });

    // 2. Adjust Stock back IN (StockMovement IN)
    for (const item of data.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });

      await prisma.stockMovement.create({
        data: {
          variantId: item.variantId,
          type: "IN",
          quantity: item.quantity,
          referenceId: saleReturn.id,
          remarks: `Returned ${item.quantity} units by customer (Return #${returnNumber})`,
        },
      });
    }

    // 3. If Customer exists & Store Credit / Refund
    if (data.customerId) {
      if (data.returnType === "STORE_CREDIT") {
        await prisma.customer.update({
          where: { id: data.customerId },
          data: { walletBalance: { increment: refundAmount } },
        });
      }

      await prisma.ledgerEntry.create({
        data: {
          customerId: data.customerId,
          type: "CREDIT",
          amount: refundAmount,
          referenceType: "SALE_RETURN",
          referenceId: saleReturn.id,
          remarks: `Sale Return #${returnNumber} (${data.returnType})`,
        },
      });
    }

    revalidatePath("/dashboard/returns");
    revalidatePath("/dashboard/sales/history");
    revalidatePath("/dashboard/inventory/stock");
    revalidatePath("/dashboard/accounting");
    return { success: true, saleReturn };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
