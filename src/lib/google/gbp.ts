import { google } from "googleapis";
import { db } from "@/lib/db";

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID!,
    process.env.AUTH_GOOGLE_SECRET!,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/gbp/callback`
  );
}

export function getGbpAuthUrl(locationId: string) {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/business.manage"],
    state: locationId,
  });
}

export async function exchangeGbpCode(code: string, locationId: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  await db.gbpToken.upsert({
    where: { locationId },
    update: {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token ?? "",
      expiresAt: new Date(tokens.expiry_date!),
    },
    create: {
      locationId,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token ?? "",
      expiresAt: new Date(tokens.expiry_date!),
    },
  });

  return tokens;
}

async function getAuthenticatedClient(locationId: string) {
  const token = await db.gbpToken.findUnique({ where: { locationId } });
  if (!token) throw new Error("No GBP token found for location");

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.expiresAt.getTime(),
  });

  // Refresh token if expired
  if (token.expiresAt < new Date()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await db.gbpToken.update({
      where: { locationId },
      data: {
        accessToken: credentials.access_token!,
        expiresAt: new Date(credentials.expiry_date!),
      },
    });
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

export async function fetchGbpReviews(
  locationId: string,
  gbpLocationName: string
) {
  const auth = await getAuthenticatedClient(locationId);

  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/${gbpLocationName}/reviews?pageSize=50`,
    {
      headers: {
        Authorization: `Bearer ${(await auth.getAccessToken()).token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GBP API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.reviews ?? [];
}

export async function postGbpReply(
  locationId: string,
  gbpLocationName: string,
  reviewName: string,
  replyText: string
) {
  const auth = await getAuthenticatedClient(locationId);

  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${(await auth.getAccessToken()).token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: replyText }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to post reply: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
