"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Truck,
  Layers,
  Calculator,
  Users,
  DollarSign,
  RotateCcw,
  Settings,
  LogOut,
  Lock,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS Billing", href: "/dashboard/sales/pos", icon: ShoppingCart },
  { name: "Expense Management", href: "/dashboard/expenses", icon: Receipt },
  { name: "Inventory", href: "/dashboard/inventory/stock", icon: Package },
  { name: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
  { name: "Category & Brand", href: "/dashboard/categories-brands", icon: Layers },
  { name: "Accounting", href: "/dashboard/accounting", icon: Calculator, badge: "PIN" },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Udhaar / Credit", href: "/dashboard/udhaar", icon: DollarSign },
  { name: "Return Goods", href: "/dashboard/returns", icon: RotateCcw },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-900 text-white dark:border-gray-800">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            VC
          </div>
          <span className="text-base font-extrabold tracking-tight text-white">
            Vijay Collection ERP
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1.5 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Lock className="h-2.5 w-2.5" />
                    <span>{item.badge}</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
