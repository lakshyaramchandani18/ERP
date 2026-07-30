"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, RefreshCw, ShieldAlert, ArrowLeft } from "lucide-react";
import {
  hasAccountingPin,
  verifyAccountingPin,
} from "@/actions/accounting";

export function AccountingPinLock({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(true);
  const [enteredPin, setEnteredPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkPinStatus() {
      const unlocked = sessionStorage.getItem("accounting_unlocked");
      if (unlocked === "true") {
        setIsLocked(false);
      } else {
        await hasAccountingPin();
        setIsLocked(true);
      }
      setChecking(false);
    }
    checkPinStatus();
  }, []);

  // Physical Keyboard Listener
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        setEnteredPin((prev) => {
          if (prev.length < 4) {
            const nextPin = prev + e.key;
            setErrorMsg("");
            if (nextPin.length === 4) {
              handleVerify(nextPin);
            }
            return nextPin;
          }
          return prev;
        });
      } else if (e.key === "Backspace") {
        setEnteredPin((prev) => prev.slice(0, -1));
        setErrorMsg("");
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleVerify(enteredPin);
      } else if (e.key === "Escape") {
        e.preventDefault();
        router.push("/dashboard");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, enteredPin, router]);

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      const updated = enteredPin + num;
      setEnteredPin(updated);
      setErrorMsg("");
      if (updated.length === 4) {
        handleVerify(updated);
      }
    }
  };

  const handleVerify = async (pinToTest: string) => {
    if (pinToTest.length < 4 || loading) return;
    setLoading(true);
    const res = await verifyAccountingPin(pinToTest);
    if (res.success && res.verified) {
      sessionStorage.setItem("accounting_unlocked", "true");
      setIsLocked(false);
      setEnteredPin("");
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect PIN. Please try again.");
      setEnteredPin("");
    }
    setLoading(false);
  };

  const handleLockOut = () => {
    sessionStorage.removeItem("accounting_unlocked");
    setIsLocked(true);
    setEnteredPin("");
  };

  if (checking) {
    return (
      <div className="flex h-96 items-center justify-center space-x-2 text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
        <span>Verifying Security Protocol...</span>
      </div>
    );
  }

  // Pure Minimal Keyboard-Friendly Lock Screen
  if (isLocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              🔒 Financial Tracker
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              This section contains confidential financial data.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Enter your 4-digit PIN
            </p>

            {/* 4 Digit Box Inputs */}
            <div className="flex justify-center space-x-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-12 w-12 rounded-xl border-2 font-black text-xl flex items-center justify-center transition-all ${
                    enteredPin.length > idx
                      ? "bg-blue-600 text-white border-blue-600 scale-105 shadow-md shadow-blue-500/30"
                      : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400"
                  }`}
                >
                  {enteredPin.length > idx ? "•" : "_"}
                </div>
              ))}
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-red-500 pt-1 animate-bounce">{errorMsg}</p>
            )}
          </div>

          {/* Unlock Button & Keyboard Shortcuts Legend */}
          <div className="space-y-2">
            <Button
              type="button"
              onClick={() => handleVerify(enteredPin)}
              disabled={enteredPin.length < 4 || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold h-11 text-sm rounded-xl shadow-lg shadow-blue-500/20"
            >
              {loading ? "Verifying..." : "Unlock"}
            </Button>

            <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-between px-1">
              <span>Type PIN on keyboard or Numpad</span>
              <span>Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border">Esc</kbd> to exit</span>
            </div>
          </div>

          {/* Clickable Keypad Grid */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto pt-1">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-extrabold text-gray-900 dark:text-gray-100 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all mx-auto flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setEnteredPin("")}
              className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all mx-auto flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-extrabold text-gray-900 dark:text-gray-100 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all mx-auto flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setEnteredPin((prev) => prev.slice(0, -1))}
              className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all mx-auto flex items-center justify-center"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked State Header Control
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-3 px-4 text-xs">
        <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300 font-semibold">
          <ShieldAlert className="h-4 w-4 text-blue-600" />
          <span>Accounting Protection Active (Unlocked)</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLockOut}
          className="h-8 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 font-bold"
        >
          <Lock className="h-3.5 w-3.5 mr-1" /> Lock Financial Tracker
        </Button>
      </div>

      {children}
    </div>
  );
}
