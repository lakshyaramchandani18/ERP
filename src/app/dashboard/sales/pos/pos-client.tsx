"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, UserPlus, CreditCard, Receipt, Scissors } from "lucide-react";
import { createSaleOrder } from "@/actions/sales";
import { InvoicePrintPreviewModal } from "@/components/invoice/InvoicePrintPreviewModal";

export function POSClient({ products }: { products: any[] }) {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (completedSale) {
      setShowPreviewModal(true);
    }
  }, [completedSale]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: any, variant: any) => {
    const existing = cart.find(c => c.variantId === variant.id);
    if (existing) {
      setCart(cart.map(c => c.variantId === variant.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { 
        variantId: variant.id, 
        name: `${product.name} (${variant.sku})`, 
        price: variant.sellingPrice, 
        mrp: variant.mrp,
        taxPercent: product.gstPercent,
        qty: 1 
      }]);
    }
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    
    const payload = {
      cart,
      customerId: null,
      subTotal: total,
      totalTax: 0, 
      grandTotal: total,
      paymentMethod: "CASH",
      amountPaid: total,
    };

    const res = await createSaleOrder(payload);
    setLoading(false);
    
    if (res.success) {
      // Create a mockup of the sale for the invoice template
      const saleForPrint = {
        invoiceNumber: res.invoiceNumber,
        saleDate: new Date(),
        customer: null,
        paymentMethod: "CASH",
        paymentStatus: "PAID",
        items: cart.map(item => ({
          id: Math.random().toString(),
          variant: { sku: "POS", product: { name: item.name } },
          quantity: item.qty,
          unitPrice: item.price,
          taxPercent: item.taxPercent,
          total: item.price * item.qty,
        })),
        subTotal: total,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: total,
      };
      
      setCompletedSale(saleForPrint);
      setCart([]);
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global F2 listener to focus search bar
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim() !== "") {
      const barcodeOrSku = search.trim().toLowerCase();
      let matchedProduct = null;
      let matchedVariant = null;

      // Find strict match in variants across all products
      for (const p of products) {
        for (const v of p.variants) {
          if (
            v.sku.toLowerCase() === barcodeOrSku ||
            v.barcode?.toLowerCase() === barcodeOrSku
          ) {
            matchedProduct = p;
            matchedVariant = v;
            break;
          }
        }
        if (matchedVariant) break;
      }

      if (matchedProduct && matchedVariant) {
        addToCart(matchedProduct, matchedVariant);
        setSearch(""); // Clear immediately for next scan
      } else {
        // Optional: show a small error or play a sound
        alert(`No product found for barcode/SKU: ${search}`);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] -m-6 bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {completedSale && (
        <InvoicePrintPreviewModal
          open={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          sale={completedSale}
        />
      )}

      {/* Left Area - Products Selection */}
      <div className="flex-1 flex flex-col h-full border-r dark:border-gray-800">
        <div className="p-4 bg-white dark:bg-gray-950 border-b dark:border-gray-800 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scan Barcode or Search by Name (Press F2 to focus)" 
              className="pl-9 h-12 text-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>
        
        {/* Quick Categories & Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredProducts.flatMap((p) => p.variants.map((v: any) => (
                <div 
                  key={v.id}
                  onClick={() => addToCart(p, v)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-transparent hover:border-blue-500 cursor-pointer shadow-sm transition-all text-center flex flex-col items-center justify-center aspect-square"
                >
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <div className="font-semibold text-sm line-clamp-2">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{v.sku}</div>
                  <div className="text-blue-600 font-bold mt-2">₹{v.sellingPrice}</div>
                </div>
            )))}
          </div>
        </div>
      </div>

      {/* Right Area - Cart & Checkout */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-white dark:bg-gray-950 flex flex-col h-full shadow-lg z-10">
        <div className="p-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
          <Input placeholder="Customer Mobile / Name" className="flex-1 bg-white dark:bg-gray-950" />
          <Button variant="outline" size="icon">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} x {item.qty}</p>
                </div>
                <div className="font-bold">
                  ₹{(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t dark:border-gray-800">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-14 font-semibold text-red-600" onClick={() => setCart([])}>
              Clear
            </Button>
            <Button variant="outline" className="h-14 font-semibold text-yellow-600">
              Hold Bill
            </Button>
            <Button 
              onClick={handleCheckout} 
              disabled={loading || cart.length === 0}
              className="col-span-2 h-16 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-md"
            >
              <CreditCard className="mr-2 h-6 w-6" /> {loading ? "Processing..." : "Pay & Print (F4)"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
