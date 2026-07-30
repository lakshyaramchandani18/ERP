"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialChartsProps {
  revenue: number;
  expenses: number;
  netProfit: number;
}

export function FinancialCharts({ revenue, expenses, netProfit }: FinancialChartsProps) {
  const data = [
    {
      name: "Financial Overview",
      Revenue: revenue,
      Expenses: expenses,
      "Net Profit": netProfit,
    },
  ];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue vs Expenses</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
