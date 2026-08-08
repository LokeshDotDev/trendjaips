"use client";

import React from "react";

const STEPS = [
  { key: "PAYMENT_PENDING", label: "Paid" }, // Buyer registers order, pays
  { key: "PAYMENT_VERIFICATION", label: "Verify" }, // Admin reviews UTR
  { key: "CONFIRMED", label: "Confirmed" }, // Ready
  { key: "SUPPLIER_PREPARING", label: "Pack" }, // Supplier packaging
  { key: "SHIPPED", label: "Ship" }, // Dispatched
  { key: "DELIVERED", label: "Deliver" }, // Received
  { key: "COMPLETED", label: "Done" }, // Process complete
];

export default function BuyerSamplesTimeline({ status }: { status: string }) {
  const getActiveIndex = () => {
    // map OUT_FOR_DELIVERY to SHIPPED/DELIVERED for stepper simplicity
    const checkStatus = status === "OUT_FOR_DELIVERY" ? "SHIPPED" : status;
    return STEPS.findIndex((step) => step.key === checkStatus);
  };

  const activeIdx = getActiveIndex();

  return (
    <div className="py-4 font-sans text-xs">
      <div className="relative">
        {/* Background track line */}
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t-2 border-slate-200"></div>
        </div>
        
        {/* Active colored line overlay */}
        {activeIdx > 0 && (
          <div
            className="absolute left-0 top-[45%] h-0.5 bg-blue-600 transition-all duration-300"
            style={{ width: `${(activeIdx / (STEPS.length - 1)) * 100}%` }}
          ></div>
        )}

        <div className="relative flex justify-between">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < activeIdx;
            const isActive = idx === activeIdx;
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                {/* Dot */}
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center relative z-10 transition-colors ${
                    isCompleted
                      ? "bg-blue-600 border-blue-600 text-white"
                      : isActive
                      ? "bg-white border-blue-600 text-blue-600"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  <span className="block h-1.5 w-1.5 rounded-full bg-current"></span>
                </div>
                
                {/* Label text */}
                <span className={`block mt-2 font-bold text-[9px] uppercase tracking-wider ${
                  isActive ? "text-blue-600 font-extrabold" : "text-slate-400 font-semibold"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
