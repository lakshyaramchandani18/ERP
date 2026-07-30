import React, { forwardRef } from "react";
import { format } from "date-fns";

export interface InvoiceTemplateProps {
  sale: any;
  shopDetails?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gst: string;
  };
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ sale, shopDetails }, ref) => {
    if (!sale) return null;

    const defaultShop = {
      name: "Clothing ERP Store",
      address: "123 Fashion Avenue, New York, NY 10001",
      phone: "+1 (555) 123-4567",
      email: "hello@clothingerp.com",
      gst: "GSTIN1234567890",
    };

    const shop = shopDetails || defaultShop;

    return (
      <div ref={ref} className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-black font-sans">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{shop.name}</h1>
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{shop.address}</p>
            <p className="text-sm text-gray-600">Tel: {shop.phone}</p>
            <p className="text-sm text-gray-600">{shop.email}</p>
            {shop.gst && <p className="text-sm font-semibold text-gray-800 mt-1">GSTIN: {shop.gst}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-gray-400 uppercase tracking-widest">Invoice</h2>
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-800">Invoice No:</p>
              <p className="text-sm text-gray-600">{sale.invoiceNumber}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-gray-800">Date:</p>
              <p className="text-sm text-gray-600">
                {format(new Date(sale.saleDate), "dd MMM yyyy, hh:mm a")}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-8 flex justify-between">
          <div className="w-1/2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b pb-1">Billed To</h3>
            {sale.customer ? (
              <>
                <p className="text-base font-semibold text-gray-900">{sale.customer.name}</p>
                <p className="text-sm text-gray-600">{sale.customer.mobile}</p>
                {sale.customer.email && <p className="text-sm text-gray-600">{sale.customer.email}</p>}
                {sale.customer.address && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{sale.customer.address}</p>}
                {sale.customer.gst && <p className="text-sm text-gray-600 mt-1">GST: {sale.customer.gst}</p>}
              </>
            ) : (
              <p className="text-base font-semibold text-gray-900">Walk-in Customer</p>
            )}
          </div>
          <div className="w-1/3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b pb-1">Payment Details</h3>
            <p className="text-sm text-gray-600"><span className="font-semibold text-gray-800">Method:</span> {sale.paymentMethod}</p>
            <p className="text-sm text-gray-600"><span className="font-semibold text-gray-800">Status:</span> {sale.paymentStatus}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left mb-8 border-collapse">
          <thead>
            <tr className="bg-gray-100 border-y-2 border-gray-300">
              <th className="py-3 px-2 text-sm font-bold text-gray-800 uppercase tracking-wider">Item Description</th>
              <th className="py-3 px-2 text-sm font-bold text-gray-800 uppercase tracking-wider text-center">Qty</th>
              <th className="py-3 px-2 text-sm font-bold text-gray-800 uppercase tracking-wider text-right">Price</th>
              <th className="py-3 px-2 text-sm font-bold text-gray-800 uppercase tracking-wider text-right">Tax</th>
              <th className="py-3 px-2 text-sm font-bold text-gray-800 uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sale.items?.map((item: any) => (
              <tr key={item.id}>
                <td className="py-4 px-2">
                  <p className="text-sm font-medium text-gray-900">{item.variant?.product?.name || "Product"}</p>
                  <p className="text-xs text-gray-500">
                    {item.variant?.sku} | {item.variant?.color?.name} | {item.variant?.size?.name}
                  </p>
                </td>
                <td className="py-4 px-2 text-center text-sm text-gray-700">{item.quantity}</td>
                <td className="py-4 px-2 text-right text-sm text-gray-700">${item.unitPrice.toFixed(2)}</td>
                <td className="py-4 px-2 text-right text-sm text-gray-700">
                  {item.taxPercent > 0 ? `${item.taxPercent}%` : "-"}
                </td>
                <td className="py-4 px-2 text-right text-sm font-medium text-gray-900">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-1/3 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${sale.subTotal.toFixed(2)}</span>
            </div>
            {sale.totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount</span>
                <span>-${sale.totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax Amount</span>
              <span>${sale.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-900 pt-3 mt-3">
              <span>Grand Total</span>
              <span>${sale.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center space-y-2">
          <p className="text-sm font-medium text-gray-800">Thank you for your business!</p>
          <p className="text-xs text-gray-500">Terms & Conditions apply. Goods once sold cannot be returned without a valid receipt.</p>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = "InvoiceTemplate";
