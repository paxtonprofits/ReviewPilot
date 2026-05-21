"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReviewWithResponse {
  id: string;
  status: string;
  response: { content: string; aiGenerated: boolean } | null;
}

export function ApproveReviewPanel({ review }: { review: ReviewWithResponse }) {
  const router = useRouter();
  const [responseText, setResponseText] = useState(
    review.response?.content ?? ""
  );
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(review.status === "POSTED");

  async function handleApprove() {
    setApproving(true);
    try {
      const res = await fetch("/api/reviews/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      setApproved(true);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
    }
  }

  if (!review.response) {
    return (
      <Card>
        <CardBody className="py-8 text-center">
          <p className="text-slate-400 text-sm">No AI response generated yet.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#0d253d]">AI-Generated Response</h2>
          {review.response.aiGenerated && (
            <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
              AI Draft
            </span>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {approved ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              <p className="text-emerald-800 text-sm font-medium">
                Response posted to Google successfully.
              </p>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{responseText}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={5}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-[#0d253d] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-slate-400 text-xs">
              You can edit the response above before posting. This will be posted publicly on Google.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/dashboard/reviews")}
              >
                Skip for now
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                loading={approving}
                disabled={!responseText.trim()}
              >
                Post to Google
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
