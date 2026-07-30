'use client';

import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceTemplateHub, InvoiceTemplateConfig } from "./InvoiceTemplateHub";
import { Button } from "@/components/ui/button";
import { Printer, Download, X, CheckCircle, FileCode } from "lucide-react";

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

  // Custom uploaded templates support
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [selectedCustomTemplateId, setSelectedCustomTemplateId] = useState<string>("builtin");
  const [renderedCustomContent, setRenderedCustomContent] = useState<any>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      (window as any).electronAPI.listCustomTemplates().then((list: any) => {
        setCustomTemplates(list || []);
      });
    }
  }, []);

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedCustomTemplateId(templateId);
    if (templateId === "builtin") {
      setRenderedCustomContent(null);
      return;
    }

    if (typeof window !== "undefined" && (window as any).electronAPI) {
      setStatusMsg("Processing custom template placeholders...");
      const res = await (window as any).electronAPI.processCustomTemplate({
        templateId,
        sale,
        shopConfig: config,
      });
      setStatusMsg(null);
      if (res.success) {
        setRenderedCustomContent(res);
      } else {
        alert(`Custom template processing error: ${res.error}`);
      }
    }
  };

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
          setStatusMsg(`Saved locally: ${res.pdfPath}`);
        } else {
          setStatusMsg(`Saved PDF in memory.`);
        }
      } else {
        pdf.save(`${invNo}.pdf`);
        setStatusMsg("PDF downloaded.");
      }
    } catch (err: any) {
      setStatusMsg(`PDF generation failed: ${err.message}`);
    } finally {
      setIsSavingPdf(false);
    }
  };

  if (!open || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-950 border dark:border-gray-800 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Printer className="h-5 w-5 text-blue-600" />
              Invoice Print Preview ({sale.invoiceNumber})
            </h2>
            <p className="text-xs text-muted-foreground">
              Format: {config?.format || "80MM_THERMAL"} | Total: ₹{sale.grandTotal?.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {customTemplates.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <label className="font-semibold flex items-center gap-1">
                  <FileCode className="h-3.5 w-3.5 text-purple-600" /> Template:
                </label>
                <select
                  value={selectedCustomTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  className="h-8 rounded border bg-background px-2 text-xs font-medium"
                >
                  <option value="builtin">Built-in ERP Template</option>
                  {customTemplates.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name} ({ct.fileType.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Body - Preview Container */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 overflow-y-auto flex justify-center items-start">
          <div className="shadow-2xl bg-white rounded overflow-hidden">
            {renderedCustomContent ? (
              renderedCustomContent.fileType === "docx" ? (
                <div
                  ref={printRef}
                  className="p-8 max-w-2xl bg-white text-black font-sans leading-normal text-sm"
                  dangerouslySetInnerHTML={{ __html: renderedCustomContent.renderedHtml }}
                />
              ) : (
                <div ref={printRef} className="p-4 bg-white">
                  <iframe
                    src={`data:application/pdf;base64,${renderedCustomContent.pdfBase64}`}
                    className="w-[210mm] h-[297mm] border-0"
                    title="PDF Custom Invoice"
                  />
                </div>
              )
            ) : (
              <InvoiceTemplateHub ref={printRef} sale={sale} config={config} />
            )}
          </div>
        </div>

        {/* Modal Footer Toolbar */}
        <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {statusMsg && (
              <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                <CheckCircle className="h-4 w-4" />
                {statusMsg}
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSavePdf}
              disabled={isSavingPdf}
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              {isSavingPdf ? "Generating PDF..." : "Save as PDF"}
            </Button>

            <Button
              type="button"
              onClick={() => handlePrint()}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Print Invoice Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
