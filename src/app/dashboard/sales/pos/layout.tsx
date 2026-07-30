import React from "react";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100">
      {children}
    </div>
  );
}
