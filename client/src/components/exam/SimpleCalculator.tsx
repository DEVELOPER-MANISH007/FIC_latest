import { useState } from "react";
import { getIcon } from "@/constants/iconMap";

const CalcIcon = getIcon("hardDrive");
const CloseIcon = getIcon("close");

/** Minimal arithmetic calculator — only rendered when an exam has calculatorEnabled on (#15). */
const SimpleCalculator = () => {
  const [open, setOpen] = useState(false);
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");

  const press = (token: string) => setExpression((prev) => prev + token);

  const evaluate = () => {
    try {
      if (!/^[0-9+\-*/.()\s]*$/.test(expression)) throw new Error("invalid");
      // eslint-disable-next-line no-new-func
      const value = Function(`"use strict"; return (${expression || "0"})`)();
      setResult(Number.isFinite(value) ? String(value) : "Error");
    } catch {
      setResult("Error");
    }
  };

  const clear = () => {
    setExpression("");
    setResult("");
  };

  const KEYS = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[var(--navy)] text-white flex items-center justify-center shadow-lg"
        title="Calculator"
      >
        <CalcIcon size={18} />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-64 card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-semibold text-[13px]">Calculator</p>
            <button onClick={() => setOpen(false)} className="text-[var(--ink-soft)]">
              <CloseIcon size={14} />
            </button>
          </div>
          <div className="bg-[var(--bg-soft)] rounded-lg p-3 mb-3 text-right">
            <p className="text-[12px] text-[var(--ink-soft)] h-4 truncate">{expression || "0"}</p>
            <p className="font-num font-bold text-lg truncate">{result}</p>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {KEYS.map((key) => (
              <button
                key={key}
                onClick={() => (key === "=" ? evaluate() : press(key))}
                className="h-9 rounded-md bg-white border border-[var(--line)] text-[13px] font-medium hover:border-[var(--royal)]"
              >
                {key}
              </button>
            ))}
            <button onClick={clear} className="col-span-4 h-9 rounded-md bg-red-50 text-red-600 text-[12.5px] font-semibold mt-1">
              Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleCalculator;
