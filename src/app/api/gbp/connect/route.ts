import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGbpAuthUrl } from "@/lib/google/gbp";
import { z } from "zod";

const schema = z.object({ locationId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { locationId } = schema.parse(body);

  const authUrl = getGbpAuthUrl(locationId);
  return NextResponse.json({ url: authUrl });
}
