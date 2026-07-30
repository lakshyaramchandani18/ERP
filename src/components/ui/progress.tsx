"use client";

import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className = "", value = 0, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 ${className}`}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-in-out"
          style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";
