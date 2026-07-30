'use client';

import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceTemplateHub, InvoiceTemplateConfig } from "./InvoiceTemplateHub";
import { Button } from "@/components/ui/button";
import { Printer, Download, X, CheckCircle } from "lucide-react";

export interface InvoicePrintPreviewModalProps {
  open: boolean;
  onClose: () => void;
  sale: any;
  config?: Partial<InvoiceTemplateConfig>;
}

export function InvoicePrintPreviewModal({
  open,
  onClose,
  sale,
  config,
}: InvoicePrintPreviewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSavingPdf, setIsSavingPdf] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleSavePdf = async () => {
    if (!printRef.current) return;
    setIsSavingPdf(true);
    setStatusMsg("Generating PDF...");

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      } as any);

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      const base64Pdf = pdf.output("datauristring").split(",")[1];

      const invNo = sale?.invoiceNumber || "Invoice";

      if (typeof window !== "undefined" && (window as any).electronAPI) {
        const res = await (window as any).electronAPI.saveInvoicePdf({
          invoiceNo: invNo,
          pdfBase64: base64Pdf,
        });

        if (res.success) {
          setStatusMsg(`PDF saved locally at ${res.pdfPath}`);
        } else {
          setStatusMsg(`PDF Save Error: ${res.error}`);
        }
      } else {
        pdf.save(`${invNo}.pdf`);
        setStatusMsg("PDF downloaded to browser downloads.");
      }
    } catch (err: any) {
      console.error("PDF Export error:", err);
      setStatusMsg(`PDF generation failed: ${err.message}`);
    } finally {
      setIsSavingPdf(false);
    }
  };

  if (!open || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-950 border dark:border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Invoice Print Preview ({sale.invoiceNumber})
            </h2>
            <p className="text-xs text-muted-foreground">
              Format: {config?.format || "80MM_THERMAL"} | Total: ₹{sale.grandTotal?.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => handlePrint()}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" /> Print Invoice
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isSavingPdf}
              onClick={handleSavePdf}
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              {isSavingPdf ? "Saving..." : "Save as PDF"}
            </Button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-900 text-xs font-medium flex items-center gap-2 border-b">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            {statusMsg}
          </div>
        )}

        {/* Scrollable Preview Workspace */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-100 dark:bg-gray-900 flex justify-center">
          <div className="shadow-lg rounded bg-white">
            <InvoiceTemplateHub ref={printRef} sale={sale} config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
