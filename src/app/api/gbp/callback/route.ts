import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exchangeGbpCode } from "@/lib/google/gbp";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const locationId = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !locationId) {
    return NextResponse.redirect(
      new URL("/dashboard?error=gbp_denied", req.url)
    );
  }

  try {
    await exchangeGbpCode(code, locationId);
    return NextResponse.redirect(
      new URL("/dashboard?connected=true", req.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard?error=gbp_failed", req.url)
    );
  }
}
