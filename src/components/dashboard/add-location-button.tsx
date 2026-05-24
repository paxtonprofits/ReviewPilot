"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function AddLocationButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address }),
      });
      if (!res.ok) throw new Error("Failed to create location");
      setOpen(false);
      setName("");
      setAddress("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5 btn-shimmer">
        <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add Location
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-modal-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[#0a1f35] text-lg font-bold">Add a location</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  You&apos;ll connect Google Business Profile next.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-150 hover:rotate-90 hover:scale-110"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Business name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Business"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0a1f35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 hover:border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Address <span className="text-slate-400 text-xs font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, Miami, FL"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0a1f35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 hover:border-slate-300"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" loading={loading}>
                  Add Location
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
