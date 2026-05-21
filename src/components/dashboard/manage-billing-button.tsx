"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ManageBillingButton({ locationId }: { locationId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleManage} loading={loading}>
      Manage Billing
    </Button>
  );
}
