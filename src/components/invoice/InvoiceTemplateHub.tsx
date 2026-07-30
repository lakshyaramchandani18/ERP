import React, { forwardRef, useEffect, useRef } from "react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import JsBarcode from "jsbarcode";

export type TemplateFormat =
  | "A4_PORTRAIT"
  | "A4_LANDSCAPE"
  | "A5_PORTRAIT"
  | "A5_LANDSCAPE"
  | "80MM_THERMAL"
  | "58MM_THERMAL";

export interface InvoiceTemplateConfig {
  id: string;
  name: string;
  isDefault: boolean;
  format: TemplateFormat;
  shopName: string;
  logoUrl?: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  gstin?: string;
  pan?: string;
  footerMessage?: string;
  termsAndConditions?: string;
  upiId?: string;

  // Toggles
  showLogo: boolean;
  showShopName: boolean;
  showShopAddress: boolean;
  showGst: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showCustomerName: boolean;
  showCustomerPhone: boolean;
  showCustomerAddress: boolean;
  showInvoiceNo: boolean;
  showInvoiceDate: boolean;
  showBarcode: boolean;
  showQrCode: boolean;
  showHsn: boolean;
  showDiscount: boolean;
  showTaxDetails: boolean;
  showPaymentMethod: boolean;
  showSignature: boolean;
  showTerms: boolean;
  showFooter: boolean;
}

export interface InvoiceTemplateHubProps {
  sale: any;
  config?: Partial<InvoiceTemplateConfig>;
}

export const defaultTemplateConfig: InvoiceTemplateConfig = {
  id: "default-80mm",
  name: "Standard 80mm Receipt",
  isDefault: true,
  format: "80MM_THERMAL",
  shopName: "Clothing ERP Store",
  shopAddress: "123 Fashion Street, Retail Hub",
  shopPhone: "+91 98765 43210",
  shopEmail: "hello@clothingerp.com",
  gstin: "22AAAAA0000A1Z5",
  pan: "ABCDE1234F",
  footerMessage: "Thank you for shopping with us! Please visit again.",
  termsAndConditions: "Goods once sold can only be exchanged within 7 days with valid receipt.",
  upiId: "clothingshop@upi",

  showLogo: false,
  showShopName: true,
  showShopAddress: true,
  showGst: true,
  showPhone: true,
  showEmail: true,
  showCustomerName: true,
  showCustomerPhone: true,
  showCustomerAddress: true,
  showInvoiceNo: true,
  showInvoiceDate: true,
  showBarcode: true,
  showQrCode: true,
  showHsn: true,
  showDiscount: true,
  showTaxDetails: true,
  showPaymentMethod: true,
  showSignature: true,
  showTerms: true,
  showFooter: true,
};

export const InvoiceTemplateHub = forwardRef<HTMLDivElement, InvoiceTemplateHubProps>(
  ({ sale, config: userConfig }, ref) => {
    const config: InvoiceTemplateConfig = { ...defaultTemplateConfig, ...userConfig };
    const barcodeRef = useRef<SVGSVGElement | null>(null);

    const invoiceNo = sale?.invoiceNumber || "INV-20260730-0001";

    useEffect(() => {
      if (barcodeRef.current && config.showBarcode) {
        try {
          JsBarcode(barcodeRef.current, invoiceNo, {
            format: "CODE128",
            width: 1.2,
            height: 35,
            displayValue: false,
          });
        } catch (e) {
          console.error("Barcode error:", e);
        }
      }
    }, [invoiceNo, config.showBarcode]);

    if (!sale) return null;

    const upiQrValue = config.upiId
      ? `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.shopName)}&am=${sale.grandTotal}&cu=INR`
      : "";

    // 1. 58mm Thermal Receipt
    if (config.format === "58MM_THERMAL") {
      return (
        <div
          ref={ref}
          className="bg-white p-2 text-black font-mono text-xs w-[58mm] mx-auto leading-tight"
          style={{ width: "58mm" }}
        >
          <div className="text-center pb-2 border-b border-black">
            {config.showShopName && <h1 className="font-bold text-sm uppercase">{config.shopName}</h1>}
            {config.showShopAddress && <p className="text-[10px] leading-none mt-1">{config.shopAddress}</p>}
            {config.showPhone && <p className="text-[10px]">Ph: {config.shopPhone}</p>}
            {config.showGst && config.gstin && <p className="text-[10px] font-bold">GSTIN: {config.gstin}</p>}
          </div>

          <div className="py-2 border-b border-black text-[10px] space-y-0.5">
            {config.showInvoiceNo && <p>Inv #: {invoiceNo}</p>}
            {config.showInvoiceDate && <p>Date: {format(new Date(sale.saleDate || Date.now()), "dd/MM/yy HH:mm")}</p>}
            {sale.customer && (
              <div className="border-t border-dashed border-gray-400 pt-1 mt-1">
                {config.showCustomerName && <p>Cust: {sale.customer.name}</p>}
                {config.showCustomerPhone && <p>Mob: {sale.customer.mobile}</p>}
              </div>
            )}
          </div>

          <table className="w-full text-left my-2 text-[10px]">
            <thead>
              <tr className="border-b border-black">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-1 pr-1">
                    {item.variant?.product?.name || "Item"}
                    {config.showHsn && item.variant?.product?.hsnCode && (
                      <span className="block text-[8px] text-gray-500">HSN: {item.variant.product.hsnCode}</span>
                    )}
                  </td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">₹{item.total?.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-black pt-2 space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{sale.subTotal?.toFixed(2)}</span>
            </div>
            {config.showDiscount && sale.totalDiscount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-₹{sale.totalDiscount?.toFixed(2)}</span>
              </div>
            )}
            {config.showTaxDetails && (
              <div className="flex justify-between">
                <span>GST:</span>
                <span>₹{sale.totalTax?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
              <span>TOTAL:</span>
              <span>₹{sale.grandTotal?.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-3 text-center space-y-2 border-t border-dashed border-gray-400 pt-2">
            {config.showQrCode && upiQrValue && (
              <div className="flex justify-center my-1">
                <QRCodeSVG value={upiQrValue} size={65} />
              </div>
            )}
            {config.showFooter && config.footerMessage && (
              <p className="text-[9px] italic">{config.footerMessage}</p>
            )}
          </div>
        </div>
      );
    }

    // 2. 80mm Thermal Receipt
    if (config.format === "80MM_THERMAL") {
      return (
        <div
          ref={ref}
          className="bg-white p-3 text-black font-sans text-xs w-[80mm] mx-auto leading-tight"
          style={{ width: "80mm" }}
        >
          <div className="text-center pb-2 border-b border-black">
            {config.showShopName && <h1 className="font-extrabold text-base uppercase">{config.shopName}</h1>}
            {config.showShopAddress && <p className="text-xs text-gray-700 mt-1">{config.shopAddress}</p>}
            <p className="text-xs">
              {config.showPhone && `Ph: ${config.shopPhone}`}
              {config.showEmail && ` | ${config.shopEmail}`}
            </p>
            {config.showGst && config.gstin && <p className="text-xs font-bold">GSTIN: {config.gstin}</p>}
          </div>

          <div className="py-2 border-b border-black text-xs grid grid-cols-2 gap-1">
            <div>
              {config.showInvoiceNo && <p className="font-semibold">Invoice #: {invoiceNo}</p>}
              {config.showInvoiceDate && (
                <p className="text-[11px] text-gray-600">{format(new Date(sale.saleDate || Date.now()), "dd-MMM-yyyy hh:mm a")}</p>
              )}
            </div>
            {sale.customer && (
              <div className="text-right">
                {config.showCustomerName && <p className="font-semibold">{sale.customer.name}</p>}
                {config.showCustomerPhone && <p className="text-[11px] text-gray-600">{sale.customer.mobile}</p>}
              </div>
            )}
          </div>

          <table className="w-full text-left my-2 text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sale.items?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-1.5 pr-1">
                    <p className="font-medium text-gray-900">{item.variant?.product?.name || "Product"}</p>
                    <p className="text-[10px] text-gray-500">
                      {item.variant?.size?.name} | {item.variant?.color?.name}
                      {config.showHsn && item.variant?.product?.hsnCode && ` | HSN:${item.variant.product.hsnCode}`}
                    </p>
                  </td>
                  <td className="py-1.5 text-center">{item.quantity}</td>
                  <td className="py-1.5 text-right">₹{item.unitPrice}</td>
                  <td className="py-1.5 text-right font-medium">₹{item.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-black pt-2 space-y-1 text-xs">
            <div className="flex justify-between text-gray-700">
              <span>Sub Total</span>
              <span>₹{sale.subTotal?.toFixed(2)}</span>
            </div>
            {config.showDiscount && sale.totalDiscount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Discount</span>
                <span>-₹{sale.totalDiscount?.toFixed(2)}</span>
              </div>
            )}
            {config.showTaxDetails && (
              <div className="flex justify-between text-gray-700">
                <span>GST Tax</span>
                <span>₹{sale.totalTax?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
              <span>Grand Total</span>
              <span>₹{sale.grandTotal?.toFixed(2)}</span>
            </div>
            {config.showPaymentMethod && (
              <div className="flex justify-between text-[11px] text-gray-600 pt-1">
                <span>Payment: {sale.paymentMethod || "CASH"}</span>
                <span>Status: {sale.paymentStatus || "PAID"}</span>
              </div>
            )}
          </div>

          <div className="mt-4 text-center space-y-2 border-t border-dashed border-gray-300 pt-3">
            {config.showQrCode && upiQrValue && (
              <div className="flex justify-center my-2">
                <QRCodeSVG value={upiQrValue} size={90} />
              </div>
            )}
            {config.showBarcode && (
              <div className="flex justify-center my-1">
                <svg ref={barcodeRef}></svg>
              </div>
            )}
            {config.showFooter && config.footerMessage && (
              <p className="text-[10px] text-gray-600 italic mt-1">{config.footerMessage}</p>
            )}
            {config.showTerms && config.termsAndConditions && (
              <p className="text-[9px] text-gray-500 mt-1">{config.termsAndConditions}</p>
            )}
          </div>
        </div>
      );
    }

    // Determine Container Dimensions for A4 / A5 Portrait / Landscape
    let widthStyle = "210mm";
    let minHeightStyle = "297mm";
    let layoutClasses = "p-8 w-[210mm] min-h-[297mm]";

    if (config.format === "A4_LANDSCAPE") {
      widthStyle = "297mm";
      minHeightStyle = "210mm";
      layoutClasses = "p-6 w-[297mm] min-h-[210mm]";
    } else if (config.format === "A5_PORTRAIT") {
      widthStyle = "148mm";
      minHeightStyle = "210mm";
      layoutClasses = "p-5 w-[148mm] min-h-[210mm] text-xs";
    } else if (config.format === "A5_LANDSCAPE") {
      widthStyle = "210mm";
      minHeightStyle = "148mm";
      layoutClasses = "p-5 w-[210mm] min-h-[148mm] text-xs";
    }

    return (
      <div
        ref={ref}
        className={`bg-white text-black font-sans leading-normal border shadow-sm mx-auto ${layoutClasses}`}
        style={{ width: widthStyle, minHeight: minHeightStyle }}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-4">
          <div className="space-y-1 max-w-[60%]">
            {config.showShopName && <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">{config.shopName}</h1>}
            {config.showShopAddress && <p className="text-xs text-gray-600 whitespace-pre-wrap">{config.shopAddress}</p>}
            <p className="text-xs text-gray-600">
              {config.showPhone && `Ph: ${config.shopPhone}`} {config.showEmail && `| Email: ${config.shopEmail}`}
            </p>
            {config.showGst && config.gstin && <p className="text-xs font-semibold text-gray-800">GSTIN: {config.gstin}</p>}
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-gray-900 text-white font-bold text-xs tracking-wider uppercase rounded">
              Tax Invoice
            </span>
            <div className="text-xs text-gray-700 space-y-0.5 mt-2">
              {config.showInvoiceNo && <p><span className="font-semibold text-gray-900">Invoice No:</span> {invoiceNo}</p>}
              {config.showInvoiceDate && <p><span className="font-semibold text-gray-900">Date:</span> {format(new Date(sale.saleDate || Date.now()), "dd-MMM-yyyy")}</p>}
              {config.showPaymentMethod && <p><span className="font-semibold text-gray-900">Payment:</span> {sale.paymentMethod || "CASH"}</p>}
            </div>
          </div>
        </div>

        {/* Customer Box */}
        {(config.showCustomerName || config.showCustomerPhone || config.showCustomerAddress) && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Billed To</h3>
              {sale.customer ? (
                <div className="text-xs space-y-0.5">
                  {config.showCustomerName && <p className="font-bold text-gray-900">{sale.customer.name}</p>}
                  {config.showCustomerPhone && <p className="text-gray-600">Phone: {sale.customer.mobile}</p>}
                  {config.showCustomerAddress && sale.customer.address && <p className="text-gray-600">Address: {sale.customer.address}</p>}
                </div>
              ) : (
                <p className="text-xs font-semibold text-gray-800">Walk-in Customer</p>
              )}
            </div>

            <div className="text-right flex flex-col justify-between items-end">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800">
                  {sale.paymentStatus || "PAID"}
                </span>
              </div>

              {config.showQrCode && upiQrValue && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-gray-500">Scan to Pay</span>
                  <QRCodeSVG value={upiQrValue} size={55} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <table className="w-full text-left border-collapse mb-4">
          <thead>
            <tr className="bg-gray-900 text-white text-[11px] uppercase tracking-wider">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Item Description</th>
              {config.showHsn && <th className="py-2 px-2 text-center">HSN</th>}
              <th className="py-2 px-2 text-center">Qty</th>
              <th className="py-2 px-2 text-right">Price</th>
              {config.showDiscount && <th className="py-2 px-2 text-right">Disc</th>}
              {config.showTaxDetails && <th className="py-2 px-2 text-right">Tax</th>}
              <th className="py-2 px-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs">
            {sale.items?.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-2 px-2 text-gray-500 font-mono">{idx + 1}</td>
                <td className="py-2 px-2">
                  <p className="font-semibold text-gray-900">{item.variant?.product?.name || "Product"}</p>
                  <p className="text-[10px] text-gray-500">SKU: {item.variant?.sku}</p>
                </td>
                {config.showHsn && (
                  <td className="py-2 px-2 text-center text-[10px] font-mono text-gray-600">
                    {item.variant?.product?.hsnCode || "-"}
                  </td>
                )}
                <td className="py-2 px-2 text-center font-medium">{item.quantity}</td>
                <td className="py-2 px-2 text-right font-mono">₹{item.unitPrice?.toFixed(2)}</td>
                {config.showDiscount && (
                  <td className="py-2 px-2 text-right text-red-600 font-mono">
                    {item.discount > 0 ? `₹${item.discount}` : "-"}
                  </td>
                )}
                {config.showTaxDetails && (
                  <td className="py-2 px-2 text-right font-mono">
                    {item.taxPercent > 0 ? `${item.taxPercent}%` : "-"}
                  </td>
                )}
                <td className="py-2 px-2 text-right font-bold text-gray-900 font-mono">₹{item.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculations */}
        <div className="flex justify-between items-start border-t-2 border-gray-900 pt-3 mb-6">
          <div className="w-1/2 space-y-2">
            {config.showTerms && config.termsAndConditions && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-800 uppercase mb-1">Terms & Conditions</h4>
                <p className="text-[10px] text-gray-600 whitespace-pre-wrap">{config.termsAndConditions}</p>
              </div>
            )}
          </div>

          <div className="w-2/5 space-y-1 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-mono">₹{sale.subTotal?.toFixed(2)}</span>
            </div>
            {config.showDiscount && sale.totalDiscount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Discount</span>
                <span className="font-mono">-₹{sale.totalDiscount?.toFixed(2)}</span>
              </div>
            )}
            {config.showTaxDetails && (
              <div className="flex justify-between text-gray-600">
                <span>GST Tax</span>
                <span className="font-mono">₹{sale.totalTax?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-gray-900 border-t-2 border-gray-900 pt-2 mt-1">
              <span>Grand Total</span>
              <span className="font-mono">₹{sale.grandTotal?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-end">
          <div className="text-[10px] text-gray-500 space-y-0.5">
            {config.showFooter && config.footerMessage && <p className="font-medium italic text-gray-800">{config.footerMessage}</p>}
            <p>Computer generated invoice.</p>
          </div>

          {config.showSignature && (
            <div className="text-center w-40 border-t border-gray-400 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-800">{config.shopName}</p>
              <p className="text-[9px] text-gray-500 mt-4">Authorized Signatory</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

InvoiceTemplateHub.displayName = "InvoiceTemplateHub";
