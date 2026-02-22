import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function getCookieOptions(overrides?: Record<string, unknown>) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    ...overrides,
  };
}

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: "No user ID in session" }, { status: 400 });
  }

  // Check if cookies are already set
  const cookieStore = await cookies();
  const existingToken = cookieStore.get("vexa-token")?.value;
  if (existingToken) {
    return NextResponse.json({ success: true, existing: true });
  }

  // Create API token
  try {
    const { getAdminAPIClient } = await import("@/lib/admin-api-client");
    const adminAPI = getAdminAPIClient();

    const response = await adminAPI.fetch(`/admin/users/${userId}/tokens`, {
      method: "POST",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[SSO] Failed to create token: ${response.status} ${text}`);
      return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
    }

    const data = await response.json();
    const apiToken = data.token;

    // Set SSO cookies
    cookieStore.set("vexa-token", apiToken, getCookieOptions());
    cookieStore.set(
      "vexa-user-info",
      JSON.stringify({
        id: Number(userId),
        email: session.user.email,
        name: session.user.name || session.user.email.split("@")[0],
      }),
      getCookieOptions()
    );

    console.log(`[SSO] Cookies set for user ${session.user.email}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[SSO] Error preparing SSO:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
