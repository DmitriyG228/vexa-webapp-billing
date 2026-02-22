import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { cookies } from "next/headers";
import { JWT } from "next-auth/jwt";

// Define a type for our user object that includes the id from our database
interface DbUser {
  id: number;
  email: string;
  name?: string | null;
  image_url?: string | null;
  created_at: string;
}

// Cookie options for SSO shared cookies
function getCookieOptions(overrides?: Record<string, unknown>) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    ...overrides,
  };
}

// Check if Microsoft OAuth is enabled
const isMicrosoftAuthEnabled = () => {
  const enable = process.env.ENABLE_MICROSOFT_AUTH;
  if (enable === "false" || enable === "0") return false;
  const hasConfig = !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
  if (enable === "true" || enable === "1") return hasConfig;
  return hasConfig;
};

// Internal API call to find or create user in our database
async function findOrCreateUser(email: string, name?: string | null, image?: string | null): Promise<DbUser | null> {
  try {
    console.log(`[NextAuth] Attempting to find or create user: ${email}`);

    const { getAdminAPIClient } = await import('@/lib/admin-api-client');
    const adminAPI = getAdminAPIClient();

    const response = await adminAPI.fetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email, name, image_url: image }),
    });

    const responseText = await response.text();

    if (response.ok) {
      try {
        const responseData = JSON.parse(responseText);
        const statusLog = response.status === 201 ? 'created' : 'found';
        console.log(`[NextAuth] User ${statusLog}: ${email}, Status: ${response.status}, ID: ${responseData.id}`);

        if (responseData && typeof responseData.id === 'number') {
          return responseData as DbUser;
        } else {
          console.error('[NextAuth] User created/found but response format unexpected:', responseData);
        }
      } catch (jsonError) {
        console.error(`[NextAuth] Successfully fetched but failed to parse JSON response (Status: ${response.status}): ${responseText}`, jsonError);
      }
    } else {
      console.error(`[NextAuth] Failed to find or create user. Status: ${response.status}, Response: ${responseText}`);
    }
  } catch (error: any) {
    console.error(`[NextAuth] Error in findOrCreateUser for ${email}:`, error);

    if (error.message?.includes('Circuit breaker is open')) {
      console.error(`[NextAuth] Circuit breaker is open - authentication temporarily disabled for ${email}`);
    }
  }

  console.error(`[NextAuth] Failed to find/create user for ${email}`);
  return null;
}

// Create an API token for the user via Admin API
async function createApiToken(userId: number): Promise<string | null> {
  try {
    const { getAdminAPIClient } = await import('@/lib/admin-api-client');
    const adminAPI = getAdminAPIClient();

    const response = await adminAPI.fetch(`/admin/users/${userId}/tokens`, {
      method: 'POST',
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[NextAuth] API token created for user ${userId}`);
      return data.token;
    } else {
      const text = await response.text();
      console.error(`[NextAuth] Failed to create API token for user ${userId}. Status: ${response.status}, Response: ${text}`);
    }
  } catch (error: any) {
    console.error(`[NextAuth] Error creating API token for user ${userId}:`, error);
  }
  return null;
}

// Validate returnUrl against trusted domains to prevent open redirects
function isAllowedReturnUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const trusted = ['vexa.ai', 'localhost'];
    return trusted.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      checks: ['pkce', 'state'],
    }),
    ...(isMicrosoftAuthEnabled()
      ? [
          AzureADProvider({
            id: "microsoft",
            name: "Microsoft",
            clientId: process.env.MICROSOFT_CLIENT_ID!,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
            tenantId: process.env.MICROSOFT_TENANT_ID || "common",
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[NextAuth] signIn callback triggered');
      const isOAuth = account?.provider === "google" || account?.provider === "microsoft";

      if (isOAuth && user.email) {
        console.log(`[NextAuth] ${account!.provider} sign in attempt for: ${user.email}`);
        const dbUser = await findOrCreateUser(user.email, user.name, user.image);

        if (!dbUser) {
          console.error(`[NextAuth] Failed to find or create user in DB for ${user.email}. Denying sign in.`);
          return false;
        }

        // Add the database user ID to the user object for the JWT callback
        user.id = String(dbUser.id);

        // Create API token and set shared cookies for SSO with Dashboard
        const apiToken = await createApiToken(dbUser.id);
        if (apiToken) {
          const cookieStore = await cookies();

          // Set vexa-token cookie (API token for Dashboard auth)
          cookieStore.set("vexa-token", apiToken, getCookieOptions());

          // Set vexa-user-info cookie (user metadata for Dashboard)
          const userInfo = JSON.stringify({
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name || user.name || dbUser.email.split("@")[0],
          });
          cookieStore.set("vexa-user-info", userInfo, getCookieOptions());

          console.log(`[NextAuth] SSO cookies set for user ${user.email}`);
        } else {
          // Token creation failed — still allow sign-in, webapp works without it
          console.warn(`[NextAuth] API token creation failed for ${user.email}, SSO cookies not set`);
        }

        console.log(`[NextAuth] User ${user.email} synced with DB ID: ${user.id}. Allowing sign in.`);
        return true;
      }
      console.log('[NextAuth] signIn condition not met or email missing.');
      return false;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        console.log(`[NextAuth] JWT callback: Added id ${user.id} to token for email ${token.email}`);
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as any).id = token.id;
        console.log(`[NextAuth] Session callback: Added id ${token.id} to session for user ${session.user.email}`);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      // Allow cross-origin redirects to trusted domains (e.g., Dashboard)
      if (isAllowedReturnUrl(url)) return url;
      return baseUrl;
    },
  },
  events: {
    async signOut() {
      // Clear SSO cookies when user signs out from webapp
      const cookieStore = await cookies();
      const domain = process.env.COOKIE_DOMAIN;
      if (domain) {
        cookieStore.set("vexa-token", "", { maxAge: 0, path: "/", domain });
        cookieStore.set("vexa-user-info", "", { maxAge: 0, path: "/", domain });
      } else {
        cookieStore.delete("vexa-token");
        cookieStore.delete("vexa-user-info");
      }
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
