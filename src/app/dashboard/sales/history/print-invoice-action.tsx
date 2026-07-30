"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { InvoicePrintPreviewModal } from "@/components/invoice/InvoicePrintPreviewModal";

export function PrintInvoiceAction({ sale }: { sale: any }) {
  const [showPreview, setShowPreview] = useState(false);
  const [savedConfig, setSavedConfig] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      (window as any).electronAPI.getSettings().then((s: any) => {
        if (s?.invoiceConfig) {
          setSavedConfig(s.invoiceConfig);
        }
      });
    }
  }, []);

  return (
    <>
      <Button
        onClick={() => setShowPreview(true)}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        title="Print Invoice / Preview / Save PDF"
      >
        <Printer className="h-4 w-4" />
      </Button>

      {showPreview && (
        <InvoicePrintPreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          sale={sale}
          config={savedConfig}
        />
      )}
    </>
  );
}
