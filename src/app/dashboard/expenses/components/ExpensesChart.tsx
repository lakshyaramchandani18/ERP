"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface TrendData {
  month: string;
  business: number;
  personal: number;
  fixed: number;
  total: number;
}

export function ExpensesChart({ data }: { data: TrendData[] }) {
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const formatCurrency = (val: number) =>
    `₹${val >= 1000 ? (val / 1000).toFixed(1) + "k" : val}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Monthly Expense Trend</h4>
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setChartType("area")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              chartType === "area"
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Area View
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              chartType === "bar"
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Bar View
          </button>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBusiness" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorFixed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPersonal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, ""]}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area type="monotone" dataKey="business" name="Business" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBusiness)" />
              <Area type="monotone" dataKey="fixed" name="Fixed Expenses" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFixed)" />
              <Area type="monotone" dataKey="personal" name="Personal" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorPersonal)" />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, ""]}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="business" name="Business" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fixed" name="Fixed Expenses" fill="#9333ea" radius={[4, 4, 0, 0]} />
              <Bar dataKey="personal" name="Personal" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
