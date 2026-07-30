'use server';

import prisma from '@/lib/prisma';

export async function recalculateAccountingSummary() {
  try {
    // 1. Revenue & Sales metrics
    const salesAggregation = await prisma.saleOrder.aggregate({
      _sum: {
        grandTotal: true,
        amountPaid: true,
        amountDue: true,
      },
    });

    const saleReturns = await prisma.saleReturn.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    const totalRevenue = (salesAggregation._sum.grandTotal || 0) - (saleReturns._sum.totalAmount || 0);

    // 2. Gross Profit
    const saleItems = await prisma.saleItem.findMany({
      select: {
        quantity: true,
        unitPrice: true,
        cogs: true,
      },
    });

    let totalCOGS = 0;
    let totalSalesVal = 0;
    for (const item of saleItems) {
      totalSalesVal += item.quantity * item.unitPrice;
      totalCOGS += item.quantity * item.cogs;
    }
    const totalGrossProfit = totalSalesVal - totalCOGS;

    // 3. Expenses
    const expensesAggregation = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalExpenses = expensesAggregation._sum.amount || 0;
    const totalNetProfit = totalGrossProfit - totalExpenses;

    // 4. Inventory Value
    const variants = await prisma.productVariant.findMany({
      select: {
        stock: true,
        landingCost: true,
        purchasePrice: true,
      },
    });

    let inventoryValue = 0;
    for (const v of variants) {
      const cost = v.landingCost > 0 ? v.landingCost : v.purchasePrice;
      inventoryValue += v.stock * cost;
    }

    // 5. Receivables & Payables
    const customersAggregation = await prisma.customer.aggregate({
      _sum: {
        outstanding: true,
      },
    });
    const totalReceivables = customersAggregation._sum.outstanding || 0;

    const suppliersAggregation = await prisma.supplier.aggregate({
      _sum: {
        outstanding: true,
      },
    });
    const totalPayables = suppliersAggregation._sum.outstanding || 0;

    // 6. Cash Flow
    const udhaarPayments = await prisma.udhaarPayment.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalCashIn = (salesAggregation._sum.amountPaid || 0) + (udhaarPayments._sum.amount || 0);

    const supplierPayments = await prisma.supplierPayment.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalCashOut = (supplierPayments._sum.amount || 0) + totalExpenses;

    // Upsert precomputed summary
    const summary = await prisma.accountingSummary.upsert({
      where: { id: 'default' },
      update: {
        totalRevenue,
        totalGrossProfit,
        totalNetProfit,
        inventoryValue,
        totalReceivables,
        totalPayables,
        totalCashIn,
        totalCashOut,
      },
      create: {
        id: 'default',
        totalRevenue,
        totalGrossProfit,
        totalNetProfit,
        inventoryValue,
        totalReceivables,
        totalPayables,
        totalCashIn,
        totalCashOut,
      },
    });

    return { success: true, summary };
  } catch (error: any) {
    console.error('Failed to update AccountingSummary:', error);
    return { success: false, error: error.message };
  }
}

export async function getAccountingSummary() {
  try {
    let summary = await prisma.accountingSummary.findUnique({
      where: { id: 'default' },
    });

    if (!summary) {
      const res = await recalculateAccountingSummary();
      summary = res.summary || null;
    }

    return { success: true, data: summary };
  } catch (error: any) {
    console.error('Failed to fetch AccountingSummary:', error);
    return { success: false, error: error.message };
  }
}
