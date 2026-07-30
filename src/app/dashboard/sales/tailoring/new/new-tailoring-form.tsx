"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTailoringOrder } from "@/actions/tailoring";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

export function NewTailoringForm({ customers }: { customers: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [fabricDetails, setFabricDetails] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");

  // Dynamic Measurements Array
  const [measurements, setMeasurements] = useState([{ key: "Chest", value: "" }, { key: "Length", value: "" }]);

  const handleAddMeasurement = () => setMeasurements([...measurements, { key: "", value: "" }]);
  
  const handleMeasurementChange = (index: number, field: "key" | "value", val: string) => {
    const newM = [...measurements];
    newM[index][field] = val;
    setMeasurements(newM);
  };
  
  const handleRemoveMeasurement = (index: number) => {
    setMeasurements(measurements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !deliveryDate) return;

    setLoading(true);
    
    // Convert array to Record<string, string>
    const measurementsObj: Record<string, string> = {};
    measurements.forEach(m => {
      if (m.key.trim()) measurementsObj[m.key.trim()] = m.value.trim();
    });

    const res = await createTailoringOrder({
      customerId,
      deliveryDate,
      fabricDetails,
      estimatedCost,
      advancePaid,
      measurements: measurementsObj,
    });
    
    setLoading(false);

    if (res.success) {
      alert("Tailoring Order created!");
      router.push("/dashboard/sales/tailoring");
    } else {
      alert("Failed to create order: " + res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Customer & Dates */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Customer</Label>
          <Select value={customerId} onValueChange={(v) => setCustomerId(v || "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.mobile})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Expected Delivery Date</Label>
          <Input 
            type="date" 
            required 
            value={deliveryDate}
            onChange={e => setDeliveryDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Item / Fabric Details</Label>
        <Textarea 
          placeholder="e.g. 2-piece Blue Suit, peak lapel, double breasted..."
          value={fabricDetails}
          onChange={e => setFabricDetails(e.target.value)}
          rows={3}
        />
      </div>

      {/* 2. Measurements */}
      <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-900/50 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Custom Measurements</h3>
          <Button type="button" variant="outline" size="sm" onClick={handleAddMeasurement}>
            <Plus className="h-4 w-4 mr-2" /> Add Field
          </Button>
        </div>
        
        {measurements.map((m, index) => (
          <div key={index} className="flex gap-4 items-center">
            <Input 
              placeholder="Measurement Name (e.g., Waist)" 
              value={m.key}
              onChange={e => handleMeasurementChange(index, "key", e.target.value)}
              className="flex-1 bg-white"
            />
            <Input 
              placeholder="Value (e.g., 34 inch)" 
              value={m.value}
              onChange={e => handleMeasurementChange(index, "value", e.target.value)}
              className="flex-1 bg-white"
            />
            <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveMeasurement(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* 3. Costs */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Estimated Total Cost (₹)</Label>
          <Input 
            type="number" 
            placeholder="0.00"
            value={estimatedCost}
            onChange={e => setEstimatedCost(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Advance Paid (₹)</Label>
          <Input 
            type="number" 
            placeholder="0.00"
            value={advancePaid}
            onChange={e => setAdvancePaid(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
          {loading ? "Saving..." : "Create Order"}
        </Button>
      </div>
    </form>
  );
}
