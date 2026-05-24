"use client";

import { useState, useEffect, useCallback } from "react";

type Prospect = {
  id: string;
  email: string;
  firstName: string;
  businessName: string;
  city: string | null;
  emailStep: number;
  lastEmailSentAt: string | null;
  replied: boolean;
  unsubscribed: boolean;
  createdAt: string;
};

const STEP_LABELS: Record<number, string> = {
  0: "Not started",
  1: "Email 1 sent",
  2: "Email 2 sent",
  3: "Email 3 sent",
  4: "Email 4 sent",
  5: "Sequence done",
};

export default function OutreachPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ firstName: "", email: "", businessName: "", city: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/outreach/add");
    const data = await res.json();
    setProspects(data.prospects ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/outreach/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Email 1 sent to ${form.firstName} at ${form.businessName}.`);
      setForm({ firstName: "", email: "", businessName: "", city: "" });
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  async function markReplied(id: string) {
    await fetch("/api/outreach/add", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, replied: true }),
    });
    load();
  }

  async function markUnsubscribed(id: string) {
    await fetch("/api/outreach/add", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, unsubscribed: true }),
    });
    load();
  }

  const active = prospects.filter((p) => !p.replied && !p.unsubscribed);
  const replied = prospects.filter((p) => p.replied);
  const unsub = prospects.filter((p) => p.unsubscribed && !p.replied);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="bg-white border-b border-slate-100 px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-[#0a1f35] tracking-tight">Outreach</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Add a prospect → Email 1 fires immediately. The cron sends follow-ups automatically.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {/* Add form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-[#0a1f35] mb-4">Add prospect</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0a1f35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              required
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0a1f35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              required
              placeholder="Business name"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0a1f35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              placeholder="City (optional)"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0a1f35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="col-span-2">
              <button
                type="submit"
                disabled={adding}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {adding ? "Sending Email 1…" : "Add & Send Email 1"}
              </button>
            </div>
          </form>
          {success && <p className="mt-3 text-sm text-emerald-600 font-medium">{success}</p>}
          {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active", value: active.length, color: "indigo" },
            { label: "Replied", value: replied.length, color: "emerald" },
            { label: "Unsubscribed", value: unsub.length, color: "slate" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-bold text-[#0a1f35] mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Pipeline table */}
        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : prospects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-slate-400 text-sm">No prospects yet. Add one above to fire Email 1.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-6 py-3">Business</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-4 py-3">Email</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-4 py-3">Step</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {prospects.map((p) => (
                  <tr key={p.id} className={p.replied || p.unsubscribed ? "opacity-50" : ""}>
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-[#0a1f35]">{p.businessName}</p>
                      <p className="text-slate-400 text-xs">{p.firstName}{p.city ? ` · ${p.city}` : ""}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{p.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${p.emailStep >= 5 ? "bg-slate-300" : "bg-indigo-500"}`} />
                        {STEP_LABELS[p.emailStep]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.replied && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Replied</span>}
                      {p.unsubscribed && !p.replied && <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Unsubscribed</span>}
                      {!p.replied && !p.unsubscribed && <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Active</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      {!p.replied && !p.unsubscribed && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => markReplied(p.id)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                          >
                            Mark replied
                          </button>
                          <button
                            onClick={() => markUnsubscribed(p.id)}
                            className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                          >
                            Unsub
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
