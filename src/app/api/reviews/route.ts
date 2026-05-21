import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {
    location: { userId: session.user.id },
  };
  if (locationId) where.locationId = locationId;
  if (status) where.status = status;

  const reviews = await db.review.findMany({
    where,
    include: { response: true, location: { select: { name: true } } },
    orderBy: { reviewDate: "desc" },
    take: 50,
  });

  return NextResponse.json(reviews);
}
