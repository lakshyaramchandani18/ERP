"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  PauseCircle,
  PlayCircle,
  CreditCard,
  QrCode,
  Banknote,
  Keyboard,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Tags,
  Store,
  Layers,
  LogOut,
  Maximize2,
  DollarSign,
} from "lucide-react";
import { createSaleOrder } from "@/actions/sales";

interface CartItem {
  variantId: string;
  sku: string;
  name: string;
  colorName?: string;
  sizeName?: string;
  sellingPrice: number;
  cogs: number;
  mrp: number;
  quantity: number;
  discount: number;
  taxPercent: number;
  total: number;
}

export default function PosKeyboardClient({
  categories,
  products,
  customers,
}: {
  categories: any[];
  products: any[];
  customers: any[];
}) {
  const router = useRouter();

  // Navigation state
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Search & Cart state
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // Hold bills
  const [heldBills, setHeldBills] = useState<Array<{ id: string; customerId: string; items: CartItem[]; time: string }>>([]);
  const [showHoldModal, setShowHoldModal] = useState(false);

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutType, setCheckoutType] = useState<"PAY_PRINT" | "FULL_UDHAAR" | "SPLIT_UDHAAR">("PAY_PRINT");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "SPLIT">("CASH");
  const [splitCashPaid, setSplitCashPaid] = useState<number>(0);
  const [udhaarDueDate, setUdhaarDueDate] = useState<string>("");
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<any | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on load and global shortcut listener
  useEffect(() => {
    searchInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCheckout) {
          setShowCheckout(false);
          return;
        }
        if (showHoldModal) {
          setShowHoldModal(false);
          return;
        }
        // Exit Fullscreen POS Mode & Return to Dashboard
        router.push("/dashboard");
        return;
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "F2" || (e.ctrlKey && e.key === "Enter")) {
        e.preventDefault();
        if (cart.length > 0) setShowCheckout(true);
      } else if (e.key === "F4") {
        e.preventDefault();
        handleHoldBill();
      } else if (e.key === "F8") {
        e.preventDefault();
        setShowHoldModal(true);
      } else if (e.key === "/" || (e.ctrlKey && e.key.toLowerCase() === "f")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, showCheckout, showHoldModal, router]);

  // Barcode / SKU quick match on search submit or enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      const term = search.trim().toLowerCase();
      // Search across all variants
      for (const prod of products) {
        for (const variant of prod.variants) {
          if (
            variant.sku?.toLowerCase() === term ||
            variant.barcode?.toLowerCase() === term ||
            prod.code?.toLowerCase() === term
          ) {
            addToCart(prod, variant);
            setSearch("");
            return;
          }
        }
      }
    }
  };

  const addToCart = (product: any, variant: any) => {
    const existingIndex = cart.findIndex((item) => item.variantId === variant.id);
    const price = variant.sellingPrice || variant.mrp || 0;
    const cogs = variant.landingCost || variant.purchasePrice || 0;
    const taxPercent = product.gstPercent || 0;

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      newCart[existingIndex].total = calculateItemTotal(newCart[existingIndex]);
      setCart(newCart);
    } else {
      const newItem: CartItem = {
        variantId: variant.id,
        sku: variant.sku,
        name: `${product.name} (${variant.color?.name || ""}, ${variant.size?.name || ""})`,
        colorName: variant.color?.name,
        sizeName: variant.size?.name,
        sellingPrice: price,
        cogs: cogs,
        mrp: variant.mrp || price,
        quantity: 1,
        discount: 0,
        taxPercent,
        total: price,
      };
      newItem.total = calculateItemTotal(newItem);
      setCart([newItem, ...cart]);
    }
  };

  const calculateItemTotal = (item: CartItem) => {
    const sub = item.sellingPrice * item.quantity - item.discount;
    const tax = (sub * item.taxPercent) / 100;
    return Math.max(0, sub + tax);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].total = calculateItemTotal(newCart[index]);
    }
    setCart(newCart);
  };

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subTotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const totalItemDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  const totalTax = cart.reduce((sum, item) => sum + ((item.sellingPrice * item.taxPercent) / 100) * item.quantity, 0);
  const grandTotalBeforeGlobal = cart.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = Math.max(0, grandTotalBeforeGlobal - globalDiscount);

  // Hold & Resume
  const handleHoldBill = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: String(Date.now()),
      customerId: selectedCustomerId,
      items: cart,
      time: new Date().toLocaleTimeString(),
    };
    setHeldBills([...heldBills, newHold]);
    setCart([]);
    alert("Bill held successfully! Press F8 to resume.");
  };

  const handleResumeBill = (held: any) => {
    setCart(held.items);
    setSelectedCustomerId(held.customerId);
    setHeldBills(heldBills.filter((h) => h.id !== held.id));
    setShowHoldModal(false);
  };

  // Complete Order
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    if ((checkoutType === "FULL_UDHAAR" || checkoutType === "SPLIT_UDHAAR") && !selectedCustomerId) {
      alert("Customer selection is required for Udhaar Billing.");
      return;
    }

    setLoading(true);

    let amountPaid = grandTotal;
    if (checkoutType === "FULL_UDHAAR") {
      amountPaid = 0;
    } else if (checkoutType === "SPLIT_UDHAAR") {
      amountPaid = splitCashPaid;
    }

    const payload = {
      cart,
      customerId: selectedCustomerId || null,
      subTotal,
      totalTax,
      grandTotal,
      paymentMethod,
      paymentMode: checkoutType,
      amountPaid,
      items: cart.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.sellingPrice,
        cogs: i.cogs,
        mrp: i.mrp,
        discount: i.discount,
        taxPercent: i.taxPercent,
        total: i.total,
      })),
      totalDiscount: totalItemDiscount + globalDiscount,
      udhaarDueDate,
    };

    const res = await createSaleOrder(payload);

    if (res.success) {
      setLastOrder(res.saleOrder);
      alert(`Sale completed successfully! Invoice #${res.invoiceNumber}`);
      setCart([]);
      setSelectedCustomerId("");
      setGlobalDiscount(0);
      setSearch("");
      setShowCheckout(false);
    } else {
      alert(res.error || "Sale creation failed");
    }

    setLoading(false);
  };

  // Filter products by Search OR Category drilldown
  const filteredProducts = products.filter((prod) => {
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        prod.name.toLowerCase().includes(term) ||
        prod.code?.toLowerCase().includes(term) ||
        prod.category?.name.toLowerCase().includes(term) ||
        prod.variants.some((v: any) => v.sku?.toLowerCase().includes(term) || v.barcode?.toLowerCase().includes(term))
      );
    }

    if (selectedCategory && prod.categoryId !== selectedCategory.id) {
      return false;
    }

    if (selectedSubcategory && prod.subcategoryId !== selectedSubcategory.id) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] gap-4 p-4 overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* LEFT PANEL: Category Hierarchy & Product Variant Grid */}
      <div className="flex-1 flex flex-col space-y-3 min-w-0">
        {/* Top Search & Shortcut Legend Bar */}
        <div className="bg-white dark:bg-gray-950 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Scan Barcode (SKU) or Search Products [Ctrl+F]..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 bg-gray-50 dark:bg-gray-900 font-medium text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
              <span className="px-2 py-0.5 bg-white dark:bg-gray-900 rounded border shadow-2xs text-blue-600">F2 / Ctrl+Enter: Pay</span>
              <span className="px-2 py-0.5 bg-white dark:bg-gray-900 rounded border shadow-2xs text-purple-600">F4: Hold</span>
              <span className="px-2 py-0.5 bg-white dark:bg-gray-900 rounded border shadow-2xs text-amber-600">F8: Resume</span>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="h-8 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" /> Exit POS (Esc)
            </Button>
          </div>
        </div>

        {/* Category Hierarchy Breadcrumb Bar */}
        <div className="bg-white dark:bg-gray-950 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between overflow-x-auto">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                !selectedCategory
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSubcategory(null);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory?.id === cat.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product & Variant Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) =>
              product.variants.map((variant: any) => (
                <button
                  key={variant.id}
                  onClick={() => addToCart(product, variant)}
                  className="group bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 flex flex-col justify-between text-left hover:border-blue-500 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        {product.category?.name || "General"}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 truncate max-w-[60px]">
                        {variant.sku}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600">
                      {product.name}
                    </h4>

                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      {variant.color?.name && (
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {variant.color.name}
                        </span>
                      )}
                      {variant.color?.name && variant.size?.name && <span>•</span>}
                      {variant.size?.name && (
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {variant.size.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-400">
                      Stock: <strong className="text-gray-700 dark:text-gray-300">{variant.stock}</strong>
                    </span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                      ₹{variant.sellingPrice?.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))
            )}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed rounded-2xl bg-white dark:bg-gray-950">
                No matching products found. Try scanning barcode or clearing filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Shopping Cart & Instant Checkout */}
      <div className="w-full lg:w-[420px] bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col justify-between overflow-hidden">
        {/* Cart Header & Customer Selector */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                Current Bill ({cart.reduce((sum, i) => sum + i.quantity, 0)} Items)
              </h3>
            </div>

            {heldBills.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHoldModal(true)}
                className="text-xs text-purple-600 border-purple-200"
              >
                <PauseCircle className="h-3.5 w-3.5 mr-1" /> Held ({heldBills.length})
              </Button>
            )}
          </div>

          {/* Customer Dropdown */}
          <Select value={selectedCustomerId} onValueChange={(val) => setSelectedCustomerId(val || "")}>
            <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-900 text-xs">
              <SelectValue placeholder="Walk-in Customer (Select or Add)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Walk-in Customer</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.mobile})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
            >
              <div className="space-y-0.5 flex-1 pr-2">
                <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 line-clamp-1">
                  {item.name}
                </h4>
                <div className="text-[11px] font-semibold text-blue-600">
                  ₹{item.sellingPrice.toLocaleString()} × {item.quantity} = ₹{item.total.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => updateQuantity(idx, -1)}
                  className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(idx, 1)}
                  className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(idx)}
                  className="h-7 w-7 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center space-y-2">
              <ShoppingCart className="h-10 w-10 text-gray-300" />
              <p className="font-semibold text-xs text-gray-600 dark:text-gray-400">Cart is empty</p>
              <p className="text-[11px]">Scan barcode or click items to add</p>
            </div>
          )}
        </div>

        {/* Bill Calculations & Action Buttons */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subTotal.toLocaleString()}</span>
            </div>

            {globalDiscount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Discount</span>
                <span>-₹{globalDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-gray-100 pt-1 border-t">
              <span>Grand Total</span>
              <span className="text-blue-600 dark:text-blue-400">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleHoldBill}
              disabled={cart.length === 0}
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold"
            >
              <PauseCircle className="h-4 w-4 mr-1" /> Hold (F4)
            </Button>

            <Button
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20"
            >
              <CreditCard className="h-4 w-4 mr-1" /> Checkout (F2)
            </Button>
          </div>
        </div>
      </div>

      {/* POS Payment Modal: 3 Choices (Hold, Pay & Print, Udhaar) */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-base">
              <span className="flex items-center space-x-2 text-blue-600">
                <ShoppingCart className="h-5 w-5" />
                <span>Checkout & Complete Bill</span>
              </span>
              <span className="font-extrabold text-lg text-emerald-600">
                ₹{grandTotal.toLocaleString()}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Customer Selection Required for Udhaar */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Select Customer <span className="text-muted-foreground">(Required for Udhaar)</span>
              </label>
              <Select value={selectedCustomerId} onValueChange={(val) => setSelectedCustomerId(val || "")}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-900 text-xs">
                  <SelectValue placeholder="Walk-in Customer (Select for Udhaar)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Walk-in Customer</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.mobile})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3 Payment Mode Tabs: Pay & Print, Full Udhaar, Split (Cash + Udhaar) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Select Payment Workflow
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutType("PAY_PRINT")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    checkoutType === "PAY_PRINT"
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Printer className="h-5 w-5 mb-1" /> Pay & Print
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutType("FULL_UDHAAR")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    checkoutType === "FULL_UDHAAR"
                      ? "bg-amber-600 text-white border-amber-600 shadow-md"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <DollarSign className="h-5 w-5 mb-1" /> Full Udhaar
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutType("SPLIT_UDHAAR")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    checkoutType === "SPLIT_UDHAAR"
                      ? "bg-purple-600 text-white border-purple-600 shadow-md"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Layers className="h-5 w-5 mb-1" /> Split (Cash + Udhaar)
                </button>
              </div>
            </div>

            {/* Pay & Print Sub-options */}
            {checkoutType === "PAY_PRINT" && (
              <div className="space-y-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 text-xs">
                <label className="font-semibold text-gray-700">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "UPI", "CARD"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2 rounded-lg border font-bold text-center ${
                        paymentMethod === m ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full Udhaar Summary Preview */}
            {checkoutType === "FULL_UDHAAR" && (
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="font-bold text-amber-900 dark:text-amber-300">100% Credit Sale (Full Udhaar)</div>
                <div className="flex justify-between text-amber-700 dark:text-amber-400">
                  <span>Bill Total: ₹{grandTotal.toLocaleString()}</span>
                  <span>Amount Paid: ₹0</span>
                </div>
                <div className="font-black text-rose-600 text-sm pt-1">
                  Udhaar Credit Created: ₹{grandTotal.toLocaleString()}
                </div>
              </div>
            )}

            {/* Split Payment (Cash + Udhaar) Inputs & Auto-Calculation */}
            {checkoutType === "SPLIT_UDHAAR" && (
              <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 space-y-2 text-xs">
                <div className="font-bold text-purple-900 dark:text-purple-300">Split Payment Mode</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700">Cash/UPI Received (₹)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 2000"
                      value={splitCashPaid || ""}
                      onChange={(e) => setSplitCashPaid(parseFloat(e.target.value) || 0)}
                      className="bg-white text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700">Remaining Udhaar (Auto)</label>
                    <div className="h-9 font-extrabold text-rose-600 flex items-center bg-white px-3 border rounded-md text-sm mt-1">
                      ₹{Math.max(0, grandTotal - (splitCashPaid || 0)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Udhaar Due Date (Optional) */}
            {(checkoutType === "FULL_UDHAAR" || checkoutType === "SPLIT_UDHAAR") && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Due Date (Default: 30 days)</label>
                <Input
                  type="date"
                  value={udhaarDueDate}
                  onChange={(e) => setUdhaarDueDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            )}

            {/* Complete Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  handleHoldBill();
                  setShowCheckout(false);
                }}
                className="w-1/3 text-xs font-bold border-purple-300 text-purple-700"
              >
                <PauseCircle className="h-4 w-4 mr-1" /> Hold (F4)
              </Button>

              <Button
                onClick={handleCompleteSale}
                disabled={loading}
                className={`flex-1 font-extrabold text-xs h-11 shadow-lg ${
                  checkoutType === "FULL_UDHAAR"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : checkoutType === "SPLIT_UDHAAR"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading
                  ? "Processing..."
                  : checkoutType === "FULL_UDHAAR"
                  ? `Complete Full Udhaar Bill (₹${grandTotal.toLocaleString()})`
                  : checkoutType === "SPLIT_UDHAAR"
                  ? `Complete Split Bill (Udhaar: ₹${Math.max(0, grandTotal - (splitCashPaid || 0)).toLocaleString()})`
                  : `Pay & Print Bill (₹${grandTotal.toLocaleString()})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Held Bills Modal */}
      <Dialog open={showHoldModal} onOpenChange={setShowHoldModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <PauseCircle className="h-5 w-5 text-purple-600" />
              <span>Held Bills Queue</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {heldBills.map((held) => (
              <div
                key={held.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border text-xs"
              >
                <div>
                  <h4 className="font-bold text-gray-900">
                    Bill #{held.id.slice(-4)} ({held.items.length} items)
                  </h4>
                  <p className="text-[10px] text-muted-foreground">Held at {held.time}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleResumeBill(held)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  <PlayCircle className="h-3.5 w-3.5 mr-1" /> Resume
                </Button>
              </div>
            ))}
            {heldBills.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground">No held bills</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
