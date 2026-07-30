"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUdhaarEntries() {
  try {
    const entries = await prisma.udhaarEntry.findMany({
      include: {
        customer: true,
        saleOrder: true,
        payments: { orderBy: { paymentDate: "desc" } },
      },
      orderBy: { dueDate: "asc" },
    });
    return { success: true, entries };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUdhaarDashboardStats() {
  try {
    const entries = await prisma.udhaarEntry.findMany({
      include: { customer: true, payments: true },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalCreditBills = entries.length;
    const activeEntries = entries.filter((e) => e.status !== "PAID");
    
    const totalOutstandingAmount = activeEntries.reduce((sum, e) => sum + e.remainingAmount, 0);

    const uniqueCustomersWithUdhaar = new Set(activeEntries.map((e) => e.customerId)).size;

    const allPayments = await prisma.udhaarPayment.findMany({
      where: { paymentDate: { gte: startOfMonth } },
    });
    const amountCollectedThisMonth = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const overdueEntries = activeEntries.filter((e) => new Date(e.dueDate) < now);
    const overdueAmount = overdueEntries.reduce((sum, e) => sum + e.remainingAmount, 0);
    const overdueCustomersCount = new Set(overdueEntries.map((e) => e.customerId)).size;

    return {
      success: true,
      stats: {
        totalOutstandingAmount,
        totalCustomersWithUdhaar: uniqueCustomersWithUdhaar,
        totalCreditBills,
        amountCollectedThisMonth,
        overdueAmount,
        overdueCustomersCount,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stats: {
        totalOutstandingAmount: 0,
        totalCustomersWithUdhaar: 0,
        totalCreditBills: 0,
        amountCollectedThisMonth: 0,
        overdueAmount: 0,
        overdueCustomersCount: 0,
      },
    };
  }
}

export async function createUdhaarEntry(data: {
  customerId: string;
  saleOrderId?: string;
  billNumber?: string;
  billAmount: number | string;
  paidAmount?: number | string;
  dueDate?: string;
  notes?: string;
}) {
  try {
    const totalAmount = parseFloat(String(data.billAmount));
    const paidAmount = data.paidAmount ? parseFloat(String(data.paidAmount)) : 0;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    // Default due date = 30 days from now if not specified
    let due: Date;
    if (data.dueDate && data.dueDate.trim()) {
      due = new Date(data.dueDate);
    } else {
      due = new Date();
      due.setDate(due.getDate() + 30);
    }

    const status = remainingAmount === 0 ? "PAID" : due < new Date() ? "OVERDUE" : "PENDING";

    const entry = await prisma.udhaarEntry.create({
      data: {
        customerId: data.customerId,
        saleOrderId: data.saleOrderId || null,
        billNumber: data.billNumber || null,
        totalAmount,
        paidAmount,
        remainingAmount,
        dueDate: due,
        status,
        notes: data.notes || null,
      },
    });

    if (paidAmount > 0) {
      await prisma.udhaarPayment.create({
        data: {
          udhaarId: entry.id,
          customerId: data.customerId,
          amount: paidAmount,
          paymentMethod: "CASH",
          notes: "Initial partial payment at bill creation",
        },
      });
    }

    // Increment Customer Outstanding by remainingAmount
    if (remainingAmount > 0) {
      await prisma.customer.update({
        where: { id: data.customerId },
        data: { outstanding: { increment: remainingAmount } },
      });

      // Create Ledger Entry (DEBIT)
      await prisma.ledgerEntry.create({
        data: {
          customerId: data.customerId,
          type: "DEBIT",
          amount: remainingAmount,
          referenceType: "UDHAAR_CREDIT",
          referenceId: entry.id,
          remarks: `Udhaar Credit Sale ${data.billNumber ? "#" + data.billNumber : ""}`,
        },
      });
    }

    revalidatePath("/dashboard/udhaar");
    revalidatePath("/dashboard/customers");
    return { success: true, entry };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUdhaarEntry(id: string, data: {
  totalAmount: number;
  dueDate: string;
  notes?: string;
}) {
  try {
    const existing = await prisma.udhaarEntry.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Udhaar record not found" };

    const diff = data.totalAmount - existing.totalAmount;
    const newRemaining = Math.max(0, existing.remainingAmount + diff);
    const due = new Date(data.dueDate);
    const status = newRemaining === 0 ? "PAID" : due < new Date() ? "OVERDUE" : "PENDING";

    const entry = await prisma.udhaarEntry.update({
      where: { id },
      data: {
        totalAmount: data.totalAmount,
        remainingAmount: newRemaining,
        dueDate: due,
        status,
        notes: data.notes || null,
      },
    });

    if (diff !== 0) {
      await prisma.customer.update({
        where: { id: existing.customerId },
        data: { outstanding: { increment: diff } },
      });
    }

    revalidatePath("/dashboard/udhaar");
    revalidatePath("/dashboard/customers");
    return { success: true, entry };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUdhaarEntry(id: string) {
  try {
    const existing = await prisma.udhaarEntry.findUnique({ where: { id } });
    if (existing) {
      if (existing.remainingAmount > 0) {
        await prisma.customer.update({
          where: { id: existing.customerId },
          data: { outstanding: { decrement: existing.remainingAmount } },
        });
      }
      await prisma.udhaarEntry.delete({ where: { id } });
    }
    revalidatePath("/dashboard/udhaar");
    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete Udhaar entry" };
  }
}

export async function recordUdhaarPayment(data: {
  udhaarId: string;
  amount: number | string;
  paymentMethod: string;
  referenceNo?: string;
  notes?: string;
}) {
  try {
    const amount = parseFloat(String(data.amount));
    const udhaar = await prisma.udhaarEntry.findUnique({ where: { id: data.udhaarId } });
    if (!udhaar) return { success: false, error: "Udhaar entry not found" };

    const newPaid = udhaar.paidAmount + amount;
    const newRemaining = Math.max(0, udhaar.totalAmount - newPaid);
    const status = newRemaining === 0 ? "PAID" : new Date(udhaar.dueDate) < new Date() ? "OVERDUE" : "PENDING";

    // 1. Record UdhaarPayment
    const payment = await prisma.udhaarPayment.create({
      data: {
        udhaarId: udhaar.id,
        customerId: udhaar.customerId,
        amount,
        paymentMethod: data.paymentMethod || "CASH",
        referenceNo: data.referenceNo || null,
        notes: data.notes || null,
      },
    });

    // 2. Update UdhaarEntry status & remaining
    await prisma.udhaarEntry.update({
      where: { id: udhaar.id },
      data: {
        paidAmount: newPaid,
        remainingAmount: newRemaining,
        status,
      },
    });

    // 3. Decrement Customer Outstanding
    await prisma.customer.update({
      where: { id: udhaar.customerId },
      data: { outstanding: { decrement: amount } },
    });

    // 4. Create Ledger Entry (CREDIT)
    await prisma.ledgerEntry.create({
      data: {
        customerId: udhaar.customerId,
        type: "CREDIT",
        amount,
        referenceType: "PAYMENT_RECEIPT",
        referenceId: payment.id,
        remarks: `Udhaar Collection via ${data.paymentMethod}`,
      },
    });

    revalidatePath("/dashboard/udhaar");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/accounting");
    return { success: true, payment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
