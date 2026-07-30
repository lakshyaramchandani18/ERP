"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, Plus, Building2 } from "lucide-react";
import { createPurchaseReturn } from "@/actions/purchase-returns";

export default function ReturnsHubClient({
  purchaseReturns,
  suppliers,
  variants,
}: {
  purchaseReturns: any[];
  suppliers: any[];
  variants: any[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Supplier Return Form
  const [supplierId, setSupplierId] = useState("");
  const [purchaseInvoiceId, setPurchaseInvoiceId] = useState("");
  const [reason, setReason] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [returnQty, setReturnQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [items, setItems] = useState<Array<{ variantId: string; name: string; quantity: number; unitPrice: number; total: number }>>([]);

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handleAddItem = () => {
    if (!selectedVariantId) return;
    const v = variants.find((i) => i.id === selectedVariantId);
    if (!v) return;

    const name = `${v.product?.name} (${v.color?.name || ""}, ${v.size?.name || ""})`;
    const price = unitPrice || v.purchasePrice || 0;
    const total = returnQty * price;

    setItems([...items, { variantId: v.id, name, quantity: returnQty, unitPrice: price, total }]);
    setSelectedVariantId("");
    setReturnQty(1);
    setUnitPrice(0);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleCreatePurchaseReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      alert("Please select a supplier.");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least 1 item to return.");
      return;
    }
    setLoading(true);
    const res = await createPurchaseReturn({
      supplierId,
      purchaseInvoiceId,
      reason,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, unitPrice: i.unitPrice })),
    });

    if (res.success) {
      setShowModal(false);
      setItems([]);
      alert("Supplier Goods Return processed! Stock updated & supplier ledger adjusted.");
      window.location.reload();
    } else {
      alert(res.error || "Failed to process return");
    }
    setLoading(false);
  };

  const grandTotal = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-gray-800 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-semibold border border-rose-400/30 mb-2">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Supplier Return Goods</span>
          </div>
          <h2 className="text-2xl font-bold">Supplier Returns</h2>
          <p className="text-xs text-slate-300">
            Process damaged or unsold inventory returns to suppliers and adjust accounts automatically
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/20"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Process Supplier Return
        </Button>
      </div>

      {/* SUPPLIER RETURNS TABLE */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow>
              <TableHead className="font-bold">Return Note #</TableHead>
              <TableHead className="font-bold">Supplier</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Reason</TableHead>
              <TableHead className="font-bold text-right">Return Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseReturns.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                  #{r.returnNumber}
                </TableCell>
                <TableCell className="font-medium text-blue-600">
                  {r.supplier?.name}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(r.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                  {r.reason}
                </TableCell>
                <TableCell className="text-right font-black text-rose-600 text-base">
                  {formatCurrency(r.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
            {purchaseReturns.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                  No supplier returns logged yet. Click "Process Supplier Return" to begin.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Process Supplier Return Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-rose-600">
              <Building2 className="h-5 w-5" />
              <span>Process Supplier Goods Return</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePurchaseReturn} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Select Supplier</label>
                <Select value={supplierId} onValueChange={(val) => setSupplierId(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.contactNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Purchase Invoice ID</label>
                <Input 
                  placeholder="Optional Invoice Ref" 
                  value={purchaseInvoiceId}
                  onChange={(e) => setPurchaseInvoiceId(e.target.value)}
                />
              </div>
            </div>

            {/* Add Variant Item */}
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border space-y-2 text-xs">
              <span className="font-bold text-gray-700 dark:text-gray-300">Add Returned Garment</span>
              <div className="space-y-2">
                <Select value={selectedVariantId} onValueChange={(val) => setSelectedVariantId(val || "")}>
                  <SelectTrigger className="bg-white dark:bg-gray-950">
                    <SelectValue placeholder="Select Product Variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.product?.name} ({v.color?.name || ""}, {v.size?.name || ""}) - Stock: {v.stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold">Return Quantity</label>
                    <Input
                      type="number"
                      min={1}
                      value={returnQty}
                      onChange={(e) => setReturnQty(parseInt(e.target.value) || 1)}
                      className="bg-white dark:bg-gray-950"
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Unit Return Price (₹)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Purchase Price"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                      className="bg-white dark:bg-gray-950"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAddItem}
                  variant="outline"
                  className="w-full text-xs font-bold bg-white dark:bg-gray-950"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Garment to Return List
                </Button>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold">Return Garments ({items.length})</label>
              <div className="max-h-[140px] overflow-y-auto space-y-2 border rounded-xl p-2 bg-white dark:bg-gray-950">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div>
                      <h5 className="font-bold">{item.name}</h5>
                      <p className="text-[10px] text-muted-foreground">
                        {item.quantity} units × ₹{item.unitPrice} = ₹{item.total}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 h-6 text-[10px]"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-4 text-xs text-muted-foreground">No garments added</div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Return Reason</label>
              <Textarea
                placeholder="e.g. Defective items, wrong dispatch..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-between items-center pt-2 font-bold text-sm">
              <span>Total Return Value:</span>
              <span className="text-rose-600 text-lg">{formatCurrency(grandTotal)}</span>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold">
              {loading ? "Processing..." : "Complete Supplier Return"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
