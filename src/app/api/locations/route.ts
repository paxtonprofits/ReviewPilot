import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locations = await db.businessLocation.findMany({
    where: { userId: session.user.id },
    include: {
      subscription: true,
      gbpToken: { select: { id: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(locations);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("id");
  if (!locationId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const location = await db.businessLocation.findFirst({
    where: { id: locationId, userId: session.user.id },
  });

  if (!location) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.businessLocation.delete({ where: { id: locationId } });

  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, address } = createSchema.parse(body);

  const location = await db.businessLocation.create({
    data: { userId: session.user.id, name, address },
  });

  return NextResponse.json(location, { status: 201 });
}
