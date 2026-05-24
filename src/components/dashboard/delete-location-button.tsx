"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteLocationButton({ locationId, locationName }: { locationId: string; locationName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/locations?id=${locationId}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Delete &ldquo;{locationName}&rdquo;?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
    >
      Delete
    </button>
  );
}
