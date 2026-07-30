-- CreateTable
CREATE TABLE "AccountingSummary" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "totalGrossProfit" REAL NOT NULL DEFAULT 0,
    "totalNetProfit" REAL NOT NULL DEFAULT 0,
    "inventoryValue" REAL NOT NULL DEFAULT 0,
    "totalReceivables" REAL NOT NULL DEFAULT 0,
    "totalPayables" REAL NOT NULL DEFAULT 0,
    "totalCashIn" REAL NOT NULL DEFAULT 0,
    "totalCashOut" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");
