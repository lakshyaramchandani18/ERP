"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPurchaseReturns() {
  try {
    const returns = await prisma.purchaseReturn.findMany({
      include: {
        supplier: true,
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

export async function createPurchaseReturn(data: {
  supplierId: string;
  purchaseInvoiceId?: string;
  reason?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
  }>;
}) {
  try {
    if (!data.supplierId || data.items.length === 0) {
      return { success: false, error: "Supplier and return items are required." };
    }

    const returnNumber = `PR-${Date.now().toString().slice(-6)}`;
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

    // 1. Create PurchaseReturn & Items
    const purchaseReturn = await prisma.purchaseReturn.create({
      data: {
        returnNumber,
        supplierId: data.supplierId,
        purchaseInvoiceId: data.purchaseInvoiceId || null,
        totalAmount,
        reason: data.reason || "Damaged/Defective goods returned",
        status: "COMPLETED",
        items: {
          create: formattedItems,
        },
      },
      include: {
        items: true,
      },
    });

    // 2. Reduce Stock for returned variants (StockMovement OUT)
    for (const item of data.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });

      await prisma.stockMovement.create({
        data: {
          variantId: item.variantId,
          type: "OUT",
          quantity: item.quantity,
          referenceId: purchaseReturn.id,
          remarks: `Returned ${item.quantity} units to supplier (Return #${returnNumber})`,
        },
      });
    }

    // 3. Reduce Supplier Outstanding balance
    await prisma.supplier.update({
      where: { id: data.supplierId },
      data: { outstanding: { decrement: totalAmount } },
    });

    // 4. Create Ledger Entry for Purchase Return (DEBIT)
    await prisma.ledgerEntry.create({
      data: {
        supplierId: data.supplierId,
        type: "DEBIT",
        amount: totalAmount,
        referenceType: "PURCHASE_RETURN",
        referenceId: purchaseReturn.id,
        remarks: `Purchase Return #${returnNumber}`,
      },
    });

    revalidatePath("/dashboard/purchases/returns");
    revalidatePath("/dashboard/suppliers");
    revalidatePath("/dashboard/inventory/stock");
    revalidatePath("/dashboard/accounting");
    return { success: true, purchaseReturn };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
