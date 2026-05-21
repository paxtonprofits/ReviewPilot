"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SubscribeButton({ locationId }: { locationId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
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
    <Button size="sm" onClick={handleSubscribe} loading={loading}>
      Start Free Trial
    </Button>
  );
}
