"use server";

import prisma from "@/lib/prisma";

export async function getDashboardMetrics() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total Revenue for this month
    const currentMonthSales = await prisma.saleOrder.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        grandTotal: true,
      },
      _count: {
        id: true,
      },
    });

    const totalRevenue = currentMonthSales._sum.grandTotal || 0;
    const totalSalesCount = currentMonthSales._count.id || 0;

    // 2. Inventory Valuation
    const inventory = await prisma.productVariant.findMany({
      select: {
        stock: true,
        purchasePrice: true,
      }
    });

    const inventoryValuation = inventory.reduce((acc, item) => {
      return acc + (item.stock * (item.purchasePrice || 0));
    }, 0);

    // 3. Active Customers
    const activeCustomers = await prisma.customer.count();

    // 4. Recent Transactions
    const recentSales = await prisma.saleOrder.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
      }
    });

    return {
      totalRevenue,
      totalSalesCount,
      inventoryValuation,
      activeCustomers,
      recentSales,
      success: true
    };
  } catch (error: any) {
    console.error("Failed to fetch dashboard metrics:", error);
    return { error: error.message || "Failed to fetch dashboard metrics" };
  }
}
