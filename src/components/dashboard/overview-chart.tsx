"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

const data = [
  { name: "Jan", sales: 4000, profit: 2400 },
  { name: "Feb", sales: 3000, profit: 1398 },
  { name: "Mar", sales: 2000, profit: 9800 },
  { name: "Apr", sales: 2780, profit: 3908 },
  { name: "May", sales: 1890, profit: 4800 },
  { name: "Jun", sales: 2390, profit: 3800 },
  { name: "Jul", sales: 3490, profit: 4300 },
  { name: "Aug", sales: 4000, profit: 2400 },
  { name: "Sep", sales: 3000, profit: 1398 },
  { name: "Oct", sales: 2000, profit: 9800 },
  { name: "Nov", sales: 2780, profit: 3908 },
  { name: "Dec", sales: 1890, profit: 4800 },
];

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip cursor={{ fill: "transparent" }} />
        <Legend />
        <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Sales" />
        <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Net Profit" />
      </BarChart>
    </ResponsiveContainer>
  );
}
