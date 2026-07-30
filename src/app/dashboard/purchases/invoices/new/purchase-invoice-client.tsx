"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPurchaseInvoice } from "@/actions/purchase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash } from "lucide-react";

export function PurchaseInvoiceClient({ suppliers, variants }: { suppliers: any[], variants: any[] }) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addItem = (variantId: string) => {
    if (!variantId) return;
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    setItems([...items, {
      variantId,
      name: `${variant.product?.name || "Product"} - ${variant.color?.name || ""} / ${variant.size?.name || ""}`,
      qty: 1,
      price: 0,
      taxPercent: 0
    }]);
  };

  const updateItem = (index: number, field: string, value: number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const subTotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const totalTax = items.reduce((acc, item) => acc + ((item.qty * item.price * (item.taxPercent || 0)) / 100), 0);
  const grandTotal = subTotal + totalTax;

  const handleSubmit = async () => {
    if (!supplierId || !invoiceNumber) {
      setError("Supplier and Invoice Number are required");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one item");
      return;
    }

    setLoading(true);
    setError("");

    const res = await createPurchaseInvoice({
      supplierId,
      invoiceNumber,
      items,
      subTotal,
      totalTax,
      grandTotal,
      amountPaid
    });

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      router.push("/dashboard/purchases/invoices");
    }
  };

  return (
    <div className="space-y-8 bg-white dark:bg-gray-950 p-6 rounded-xl border dark:border-gray-800 shadow-sm">
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Supplier</Label>
          <Select onValueChange={(val: string | null) => setSupplierId(val || "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier..." />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Invoice Number</Label>
          <Input 
            value={invoiceNumber} 
            onChange={(e) => setInvoiceNumber(e.target.value)} 
            placeholder="e.g. INV-12345" 
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Items</h3>
        <div className="flex gap-4">
          <Select onValueChange={(val: string | null) => addItem(val || "")}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Add product variant..." />
            </SelectTrigger>
            <SelectContent>
              {variants.map(v => (
                <SelectItem key={v.id} value={v.id}>
                  {v.product?.name || "Product"} ({v.color?.name || ""}, {v.size?.name || ""})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {items.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-[100px]">Qty</TableHead>
                  <TableHead className="w-[150px]">Unit Price</TableHead>
                  <TableHead className="w-[100px]">Tax %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="1" 
                        value={item.qty} 
                        onChange={(e) => updateItem(index, "qty", parseFloat(e.target.value) || 0)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0" 
                        value={item.price} 
                        onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0" 
                        value={item.taxPercent} 
                        onChange={(e) => updateItem(index, "taxPercent", parseFloat(e.target.value) || 0)} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ${((item.qty * item.price) + (item.qty * item.price * (item.taxPercent || 0) / 100)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex justify-end space-y-2">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax:</span>
            <span>${totalTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Grand Total:</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
          
          <div className="pt-4 space-y-2">
            <Label>Amount Paid Now</Label>
            <Input 
              type="number" 
              min="0" 
              max={grandTotal}
              value={amountPaid} 
              onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} 
            />
          </div>

          <Button 
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </div>
    </div>
  );
}
