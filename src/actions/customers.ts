"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: { select: { saleOrders: true, udhaarEntries: true, customerVisits: true } },
        customerVisits: { orderBy: { visitDate: "desc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: customers };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCustomer(data: {
  name: string;
  mobile: string;
  email?: string;
  gst?: string;
  address?: string;
  notes?: string;
}) {
  try {
    if (!data.name.trim() || !data.mobile.trim()) {
      return { success: false, error: "Customer Name and Mobile Number are required." };
    }

    const existing = await prisma.customer.findUnique({ where: { mobile: data.mobile.trim() } });
    if (existing) {
      return { success: false, error: `A customer with mobile ${data.mobile} already exists.` };
    }

    const customer = await prisma.customer.create({
      data: {
        name: data.name.trim(),
        mobile: data.mobile.trim(),
        email: data.email?.trim() || null,
        gst: data.gst?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/dashboard/customers");
    return { success: true, customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomer(id: string, data: {
  name: string;
  mobile: string;
  email?: string;
  gst?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name.trim(),
        mobile: data.mobile.trim(),
        email: data.email?.trim() || null,
        gst: data.gst?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${id}`);
    return { success: true, customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } });
    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete customer" };
  }
}

export async function getCustomerDetails(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        saleOrders: { orderBy: { createdAt: "desc" }, include: { items: true } },
        udhaarEntries: { orderBy: { dueDate: "asc" } },
        customerVisits: { orderBy: { visitDate: "desc" } },
        ledgerEntries: { orderBy: { date: "desc" } },
      },
    });

    if (!customer) return { success: false, error: "Customer not found" };

    const totalBills = customer.saleOrders.length;
    const totalSpent = customer.saleOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const avgBillValue = totalBills > 0 ? totalSpent / totalBills : 0;

    return {
      success: true,
      data: {
        customer,
        totalBills,
        totalSpent,
        avgBillValue,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCustomerAnalytics() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        saleOrders: true,
        customerVisits: true,
        udhaarEntries: { where: { status: { in: ["PENDING", "OVERDUE"] } } },
      },
    });

    const visits = await prisma.customerVisit.findMany({
      orderBy: { visitDate: "asc" },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const totalCustomers = customers.length;
    let totalPurchasesCount = 0;
    let totalAmountSpent = 0;
    let totalOutstandingUdhaar = 0;

    const monthlyVisitLogs = visits.filter((v) => new Date(v.visitDate) >= startOfMonth);
    const yearlyVisitLogs = visits.filter((v) => new Date(v.visitDate) >= startOfYear);

    const monthlyVisitCount = monthlyVisitLogs.length;
    const yearlyVisitCount = yearlyVisitLogs.length;

    // Monthly Repeat Customers (customers who visited >= 2 times this month)
    const monthlyCustomerMap = new Map<string, number>();
    monthlyVisitLogs.forEach((v) => {
      monthlyCustomerMap.set(v.customerId, (monthlyCustomerMap.get(v.customerId) || 0) + 1);
    });

    let monthlyRepeatCount = 0;
    monthlyCustomerMap.forEach((count) => {
      if (count > 1) monthlyRepeatCount++;
    });

    // Yearly Repeat Customers
    const yearlyCustomerMap = new Map<string, number>();
    yearlyVisitLogs.forEach((v) => {
      yearlyCustomerMap.set(v.customerId, (yearlyCustomerMap.get(v.customerId) || 0) + 1);
    });

    let yearlyRepeatCount = 0;
    yearlyCustomerMap.forEach((count) => {
      if (count > 1) yearlyRepeatCount++;
    });

    // Overall Repeat Visit Rate
    let repeatCustomersTotal = 0;
    customers.forEach((c) => {
      totalPurchasesCount += c.saleOrders.length;
      totalAmountSpent += c.saleOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      totalOutstandingUdhaar += c.outstanding;
      if (c.visitCount > 1 || c.customerVisits.length > 1) {
        repeatCustomersTotal++;
      }
    });

    const avgBillValue = totalPurchasesCount > 0 ? totalAmountSpent / totalPurchasesCount : 0;
    const repeatVisitRate = totalCustomers > 0 ? (repeatCustomersTotal / totalCustomers) * 100 : 0;

    // Monthly visits trend (Last 6 Months)
    const monthlyVisitsTrend: Array<{ month: string; visits: number; newCustomers: number; returningCustomers: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthLabel = d.toLocaleString("default", { month: "short", year: "2-digit" });

      const mVisits = visits.filter((v) => new Date(v.visitDate) >= d && new Date(v.visitDate) < nextD);
      const mCustMap = new Map<string, number>();
      mVisits.forEach((v) => mCustMap.set(v.customerId, (mCustMap.get(v.customerId) || 0) + 1));

      let returning = 0;
      let newC = 0;
      mCustMap.forEach((count, cId) => {
        const custObj = customers.find((c) => c.id === cId);
        if (custObj && new Date(custObj.createdAt) >= d && new Date(custObj.createdAt) < nextD) {
          newC++;
        } else {
          returning++;
        }
      });

      monthlyVisitsTrend.push({
        month: monthLabel,
        visits: mVisits.length,
        newCustomers: newC,
        returningCustomers: returning,
      });
    }

    return {
      success: true,
      analytics: {
        totalCustomers,
        totalPurchasesCount,
        totalAmountSpent,
        avgBillValue,
        totalOutstandingUdhaar,
        monthlyVisitCount,
        yearlyVisitCount,
        monthlyRepeatCount,
        yearlyRepeatCount,
        repeatVisitRate: Number(repeatVisitRate.toFixed(1)),
        monthlyVisitsTrend,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
