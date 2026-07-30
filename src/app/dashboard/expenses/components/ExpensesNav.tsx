"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarSync, Receipt, Landmark, Tags } from "lucide-react";

const navItems = [
  { name: "Expense Dashboard", href: "/dashboard/expenses", icon: LayoutDashboard },
  { name: "Fixed Expenses", href: "/dashboard/expenses/fixed", icon: CalendarSync },
  { name: "Manual Expenses", href: "/dashboard/expenses/manual", icon: Receipt },
  { name: "Loan Manager", href: "/dashboard/expenses/loans", icon: Landmark },
  { name: "Categories", href: "/dashboard/expenses/categories", icon: Tags },
];

export function ExpensesNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b pb-4 mb-6 dark:border-gray-800">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard/expenses"
            ? pathname === "/dashboard/expenses"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
