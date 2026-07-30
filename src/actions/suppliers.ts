"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  return await prisma.supplier.findMany({
    include: {
      _count: { select: { purchaseInvoices: true, supplierBills: true, purchaseReturns: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createSupplier(data: {
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  creditDays?: number | string;
  openingBalance?: number | string;
  notes?: string;
}) {
  try {
    const openingBal = parseFloat(String(data.openingBalance || 0)) || 0;
    const credDays = parseInt(String(data.creditDays || 30)) || 30;

    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        companyName: data.companyName || null,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        gstin: data.gstin || null,
        pan: data.pan || null,
        address: data.address || null,
        creditDays: credDays,
        openingBalance: openingBal,
        outstanding: openingBal,
        notes: data.notes || null,
      },
    });

    // If opening balance > 0, log opening ledger entry
    if (openingBal > 0) {
      await prisma.ledgerEntry.create({
        data: {
          supplierId: supplier.id,
          type: "CREDIT",
          amount: openingBal,
          referenceType: "OPENING_BALANCE",
          referenceId: supplier.id,
          remarks: "Opening Outstanding Balance",
        },
      });
    }

    revalidatePath("/dashboard/suppliers");
    return { success: true, supplier };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSupplier(
  id: string,
  data: {
    name: string;
    companyName?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    gstin?: string;
    pan?: string;
    address?: string;
    creditDays?: number | string;
    openingBalance?: number | string;
    notes?: string;
  }
) {
  try {
    const openingBal = parseFloat(String(data.openingBalance || 0)) || 0;
    const credDays = parseInt(String(data.creditDays || 30)) || 30;

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Supplier not found" };

    // Calculate outstanding shift if opening balance changed
    const openingDiff = openingBal - (existing.openingBalance || 0);
    const newOutstanding = Math.max(0, (existing.outstanding || 0) + openingDiff);

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        companyName: data.companyName || null,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        gstin: data.gstin || null,
        pan: data.pan || null,
        address: data.address || null,
        creditDays: credDays,
        openingBalance: openingBal,
        outstanding: newOutstanding,
        notes: data.notes || null,
      },
    });

    revalidatePath("/dashboard/suppliers");
    revalidatePath(`/dashboard/suppliers/${id}`);
    return { success: true, supplier };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({
      where: { id },
    });
    revalidatePath("/dashboard/suppliers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete supplier" };
  }
}

export async function getSupplierDashboardStats() {
  try {
    const suppliers = await prisma.supplier.findMany();
    const bills = await prisma.supplierBill.findMany({
      include: { supplier: true },
    });
    const payments = await prisma.supplierPayment.findMany();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Auto-recalculate overdue status for bills
    for (const b of bills) {
      const isOverdue = b.status !== "PAID" && new Date(b.dueDate) < now;
      if (isOverdue && b.status !== "OVERDUE") {
        await prisma.supplierBill.update({
          where: { id: b.id },
          data: { status: "OVERDUE" },
        });
        b.status = "OVERDUE";
      }
    }

    // Card 1 – Total Purchase Bills
    const totalPurchaseBillsCount = bills.length;
    const totalPurchaseBillsValue = bills.reduce((sum, b) => sum + b.amount, 0);

    // Card 2 – Pending Bills (UNPAID, PARTIAL, OVERDUE)
    const pendingBills = bills.filter((b) => b.status === "UNPAID" || b.status === "PARTIAL" || b.status === "OVERDUE");
    const pendingBillsCount = pendingBills.length;
    const totalOutstandingAmount = pendingBills.reduce((sum, b) => sum + b.remainingAmount, 0);

    // Card 3 – Paid Bills (Fully Paid)
    const paidBills = bills.filter((b) => b.status === "PAID");
    const paidBillsCount = paidBills.length;
    const totalAmountPaid = bills.reduce((sum, b) => sum + b.paidAmount, 0);

    // Card 4 – Bills Paid This Month
    const thisMonthPayments = payments.filter((p) => new Date(p.paymentDate) >= startOfMonth);
    const paidThisMonthCount = new Set(thisMonthPayments.map((p) => p.billId || p.id)).size;
    const paidThisMonthAmount = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Card 5 – Bills Due This Month
    const dueThisMonthBills = bills.filter((b) => {
      const d = new Date(b.dueDate);
      return d >= startOfMonth && d <= endOfMonth && b.status !== "PAID";
    });
    const dueThisMonthCount = dueThisMonthBills.length;
    const dueThisMonthAmount = dueThisMonthBills.reduce((sum, b) => sum + b.remainingAmount, 0);

    return {
      success: true,
      stats: {
        totalSuppliers: suppliers.length,
        // Card 1
        totalPurchaseBillsCount,
        totalPurchaseBillsValue,
        // Card 2
        pendingBillsCount,
        totalOutstandingAmount,
        // Card 3
        paidBillsCount,
        totalAmountPaid,
        // Card 4
        paidThisMonthCount,
        paidThisMonthAmount,
        // Card 5
        dueThisMonthCount,
        dueThisMonthAmount,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stats: {
        totalSuppliers: 0,
        totalPurchaseBillsCount: 0,
        totalPurchaseBillsValue: 0,
        pendingBillsCount: 0,
        totalOutstandingAmount: 0,
        paidBillsCount: 0,
        totalAmountPaid: 0,
        paidThisMonthCount: 0,
        paidThisMonthAmount: 0,
        dueThisMonthCount: 0,
        dueThisMonthAmount: 0,
      },
    };
  }
}

export async function getSupplierDetails(id: string) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseInvoices: { orderBy: { invoiceDate: "desc" } },
        supplierBills: { orderBy: { billDate: "desc" }, include: { payments: true } },
        supplierPayments: { orderBy: { paymentDate: "desc" } },
        purchaseReturns: { orderBy: { date: "desc" }, include: { items: { include: { variant: { include: { product: true } } } } } },
        ledgerEntries: { orderBy: { date: "asc" } },
      },
    });

    if (!supplier) return { success: false, error: "Supplier not found" };

    const now = new Date();

    // Recalculate overdue statuses
    const updatedBills = supplier.supplierBills.map((b) => {
      const isOverdue = b.status !== "PAID" && new Date(b.dueDate) < now;
      return {
        ...b,
        status: isOverdue ? "OVERDUE" : b.status,
      };
    });

    const upcomingBills = updatedBills.filter((b) => b.status === "UNPAID" || b.status === "PARTIAL");
    const overdueBills = updatedBills.filter((b) => b.status === "OVERDUE" || (b.status !== "PAID" && new Date(b.dueDate) < now));

    // Construct full Ledger sequence: Opening Balance + Bills + Payments + Returns
    const ledger: Array<{
      id: string;
      date: Date;
      type: "OPENING_BALANCE" | "PURCHASE_BILL" | "PAYMENT" | "PURCHASE_RETURN" | "CREDIT_NOTE" | "DEBIT_NOTE";
      reference: string;
      amount: number;
      isDebit: boolean; // debit reduces outstanding (payments, returns)
      isCredit: boolean; // credit increases outstanding (bills, opening bal)
      runningBalance: number;
      remarks: string;
    }> = [];

    let currentBalance = 0;

    if (supplier.openingBalance && supplier.openingBalance > 0) {
      currentBalance += supplier.openingBalance;
      ledger.push({
        id: "opening-bal",
        date: supplier.createdAt,
        type: "OPENING_BALANCE",
        reference: "OPENING",
        amount: supplier.openingBalance,
        isDebit: false,
        isCredit: true,
        runningBalance: currentBalance,
        remarks: "Opening Balance",
      });
    }

    // Combine all financial transactions sorted by date
    const transactions: Array<{
      date: Date;
      type: "PURCHASE_BILL" | "PAYMENT" | "PURCHASE_RETURN";
      id: string;
      reference: string;
      amount: number;
      remarks: string;
    }> = [];

    supplier.supplierBills.forEach((b) => {
      transactions.push({
        date: new Date(b.billDate),
        type: "PURCHASE_BILL",
        id: b.id,
        reference: `#${b.billNumber}`,
        amount: b.amount,
        remarks: b.notes || `Purchase Bill #${b.billNumber}${b.invoiceNumber ? ` (Inv: ${b.invoiceNumber})` : ""}`,
      });
    });

    supplier.supplierPayments.forEach((p) => {
      transactions.push({
        date: new Date(p.paymentDate),
        type: "PAYMENT",
        id: p.id,
        reference: p.referenceNo ? `Txn: ${p.referenceNo}` : `Payment`,
        amount: p.amount,
        remarks: `Payment via ${p.paymentMethod} ${p.notes ? `- ${p.notes}` : ""}`,
      });
    });

    supplier.purchaseReturns.forEach((r) => {
      transactions.push({
        date: new Date(r.date),
        type: "PURCHASE_RETURN",
        id: r.id,
        reference: `#${r.returnNumber}`,
        amount: r.totalAmount,
        remarks: `Goods Return #${r.returnNumber} (${r.reason || "Returned"})`,
      });
    });

    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    transactions.forEach((tx) => {
      if (tx.type === "PURCHASE_BILL") {
        currentBalance += tx.amount;
        ledger.push({
          id: tx.id,
          date: tx.date,
          type: "PURCHASE_BILL",
          reference: tx.reference,
          amount: tx.amount,
          isDebit: false,
          isCredit: true,
          runningBalance: currentBalance,
          remarks: tx.remarks,
        });
      } else if (tx.type === "PAYMENT") {
        currentBalance = Math.max(0, currentBalance - tx.amount);
        ledger.push({
          id: tx.id,
          date: tx.date,
          type: "PAYMENT",
          reference: tx.reference,
          amount: tx.amount,
          isDebit: true,
          isCredit: false,
          runningBalance: currentBalance,
          remarks: tx.remarks,
        });
      } else if (tx.type === "PURCHASE_RETURN") {
        currentBalance = Math.max(0, currentBalance - tx.amount);
        ledger.push({
          id: tx.id,
          date: tx.date,
          type: "PURCHASE_RETURN",
          reference: tx.reference,
          amount: tx.amount,
          isDebit: true,
          isCredit: false,
          runningBalance: currentBalance,
          remarks: tx.remarks,
        });
      }
    });

    return {
      success: true,
      supplier: {
        ...supplier,
        supplierBills: updatedBills,
      },
      upcomingBills,
      overdueBills,
      ledger,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSupplierBill(data: {
  supplierId: string;
  billNumber: string;
  invoiceNumber?: string;
  amount: number | string;
  billDate?: string;
  creditDays?: number | string;
  dueDate?: string;
  notes?: string;
}) {
  try {
    const amount = parseFloat(String(data.amount));
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Please enter a valid bill amount" };
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
    if (!supplier) return { success: false, error: "Supplier not found" };

    const billDateObj = data.billDate ? new Date(data.billDate) : new Date();
    const credDays = data.creditDays ? parseInt(String(data.creditDays)) : (supplier.creditDays || 30);

    let dueDateObj: Date;
    if (data.dueDate) {
      dueDateObj = new Date(data.dueDate);
    } else {
      dueDateObj = new Date(billDateObj);
      dueDateObj.setDate(dueDateObj.getDate() + credDays);
    }

    const isOverdue = dueDateObj < new Date();
    const status = isOverdue ? "OVERDUE" : "UNPAID";

    const bill = await prisma.supplierBill.create({
      data: {
        supplierId: data.supplierId,
        billNumber: data.billNumber,
        invoiceNumber: data.invoiceNumber || null,
        amount,
        paidAmount: 0,
        remainingAmount: amount,
        billDate: billDateObj,
        creditDays: credDays,
        dueDate: dueDateObj,
        status,
        notes: data.notes || null,
      },
    });

    // Increase Supplier Outstanding
    await prisma.supplier.update({
      where: { id: data.supplierId },
      data: { outstanding: { increment: amount } },
    });

    // Create Ledger Credit entry
    await prisma.ledgerEntry.create({
      data: {
        supplierId: data.supplierId,
        type: "CREDIT",
        amount,
        referenceType: "SUPPLIER_BILL",
        referenceId: bill.id,
        remarks: `Purchase Bill #${data.billNumber}${data.invoiceNumber ? ` (Inv: ${data.invoiceNumber})` : ""}`,
      },
    });

    revalidatePath("/dashboard/suppliers");
    revalidatePath(`/dashboard/suppliers/${data.supplierId}`);
    revalidatePath("/dashboard");
    return { success: true, bill };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function editSupplierBill(
  id: string,
  data: {
    billNumber: string;
    invoiceNumber?: string;
    amount: number | string;
    billDate?: string;
    creditDays?: number | string;
    dueDate?: string;
    notes?: string;
  }
) {
  try {
    const existingBill = await prisma.supplierBill.findUnique({ where: { id } });
    if (!existingBill) return { success: false, error: "Bill not found" };

    const newAmount = parseFloat(String(data.amount));
    if (isNaN(newAmount) || newAmount <= 0) {
      return { success: false, error: "Please enter a valid amount" };
    }

    const amountDiff = newAmount - existingBill.amount;
    const newRemaining = Math.max(0, existingBill.remainingAmount + amountDiff);

    const billDateObj = data.billDate ? new Date(data.billDate) : existingBill.billDate;
    const credDays = data.creditDays ? parseInt(String(data.creditDays)) : existingBill.creditDays;

    let dueDateObj: Date;
    if (data.dueDate) {
      dueDateObj = new Date(data.dueDate);
    } else {
      dueDateObj = new Date(billDateObj);
      dueDateObj.setDate(dueDateObj.getDate() + credDays);
    }

    let status = existingBill.status;
    if (newRemaining === 0) {
      status = "PAID";
    } else if (dueDateObj < new Date()) {
      status = "OVERDUE";
    } else if (existingBill.paidAmount > 0) {
      status = "PARTIAL";
    } else {
      status = "UNPAID";
    }

    const updatedBill = await prisma.supplierBill.update({
      where: { id },
      data: {
        billNumber: data.billNumber,
        invoiceNumber: data.invoiceNumber || null,
        amount: newAmount,
        remainingAmount: newRemaining,
        billDate: billDateObj,
        creditDays: credDays,
        dueDate: dueDateObj,
        status,
        notes: data.notes || null,
      },
    });

    if (amountDiff !== 0) {
      await prisma.supplier.update({
        where: { id: existingBill.supplierId },
        data: { outstanding: { increment: amountDiff } },
      });
    }

    revalidatePath("/dashboard/suppliers");
    revalidatePath(`/dashboard/suppliers/${existingBill.supplierId}`);
    revalidatePath("/dashboard");
    return { success: true, bill: updatedBill };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSupplierBill(id: string) {
  try {
    const bill = await prisma.supplierBill.findUnique({ where: { id } });
    if (!bill) return { success: false, error: "Bill not found" };

    await prisma.supplierBill.delete({ where: { id } });

    // Reduce outstanding by remaining un-paid bill balance
    if (bill.remainingAmount > 0) {
      await prisma.supplier.update({
        where: { id: bill.supplierId },
        data: { outstanding: { decrement: bill.remainingAmount } },
      });
    }

    revalidatePath("/dashboard/suppliers");
    revalidatePath(`/dashboard/suppliers/${bill.supplierId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function paySupplierBill(data: {
  supplierId: string;
  billId?: string;
  amount: number | string;
  paymentMethod: string;
  paymentDate?: string;
  referenceNo?: string;
  notes?: string;
}) {
  try {
    const amount = parseFloat(String(data.amount));
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Please enter a valid payment amount" };
    }
    const payDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

    // 1. Create SupplierPayment record
    const payment = await prisma.supplierPayment.create({
      data: {
        supplierId: data.supplierId,
        billId: data.billId || null,
        amount,
        paymentMethod: data.paymentMethod || "BANK",
        paymentDate: payDate,
        referenceNo: data.referenceNo || null,
        notes: data.notes || null,
      },
    });

    // 2. Update Bill status if linked
    if (data.billId) {
      const bill = await prisma.supplierBill.findUnique({ where: { id: data.billId } });
      if (bill) {
        const newPaid = bill.paidAmount + amount;
        const newRemaining = Math.max(0, bill.amount - newPaid);
        const status = newRemaining === 0 ? "PAID" : "PARTIAL";

        await prisma.supplierBill.update({
          where: { id: bill.id },
          data: {
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            status,
          },
        });
      }
    }

    // 3. Reduce Supplier Outstanding
    await prisma.supplier.update({
      where: { id: data.supplierId },
      data: { outstanding: { decrement: amount } },
    });

    // 4. Automatically create a Business Expense entry ("Supplier Payment")
    let category = await prisma.expenseCategory.findUnique({
      where: { name: "Supplier Payments" },
    });
    if (!category) {
      category = await prisma.expenseCategory.create({
        data: { name: "Supplier Payments", type: "BUSINESS" },
      });
    }

    const supplierObj = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
    await prisma.expense.create({
      data: {
        title: `Supplier Payment: ${supplierObj?.name || "Supplier"}`,
        amount,
        date: payDate,
        categoryId: category.id,
        expenseType: "BUSINESS",
        paymentMethod: data.paymentMethod || "BANK",
        vendor: supplierObj?.name || null,
        reference: data.referenceNo || null,
        remarks: data.notes || `Auto-logged supplier payment against bill`,
      },
    });

    // 5. Create Ledger Debit entry
    await prisma.ledgerEntry.create({
      data: {
        supplierId: data.supplierId,
        type: "DEBIT",
        amount,
        referenceType: "PAYMENT_RECEIPT",
        referenceId: payment.id,
        remarks: `Payment via ${data.paymentMethod}${data.referenceNo ? ` (Ref: ${data.referenceNo})` : ""}`,
      },
    });

    revalidatePath("/dashboard/suppliers");
    revalidatePath(`/dashboard/suppliers/${data.supplierId}`);
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/accounting");
    revalidatePath("/dashboard");
    return { success: true, payment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
