import prisma from "@/lib/prisma";
import { getCustomerAnalytics } from "@/actions/customers";
import CustomerCrmClient from "./CustomerCrmClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  let customers: any[] = [];
  try {
    customers = await prisma.customer.findMany({
      include: {
        _count: { select: { saleOrders: true, udhaarEntries: true } },
        customerVisits: { orderBy: { visitDate: "desc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("Prisma Customer findMany error, falling back to basic query:", err);
    try {
      customers = await prisma.customer.findMany({
        orderBy: { name: "asc" },
      });
    } catch (e) {
      customers = [];
    }
  }

  const analyticsRes = await getCustomerAnalytics();

  return (
    <div className="p-8 pt-6">
      <CustomerCrmClient
        customers={customers}
        analytics={analyticsRes.analytics || {
          totalCustomers: customers.length,
          totalPurchasesCount: 0,
          totalAmountSpent: 0,
          avgBillValue: 0,
          totalOutstandingUdhaar: 0,
          monthlyVisitCount: 0,
          yearlyVisitCount: 0,
          monthlyRepeatCount: 0,
          yearlyRepeatCount: 0,
          repeatVisitRate: 0,
          monthlyVisitsTrend: [],
        }}
      />
    </div>
  );
}
