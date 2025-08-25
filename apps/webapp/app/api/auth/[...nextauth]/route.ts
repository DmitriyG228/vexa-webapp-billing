import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
// Stripe logic is delegated to Billing service; no direct Stripe SDK usage here.

// Define a type for our user object that includes the id from our database
interface DbUser {
  id: number;
  email: string;
  name?: string | null;
  image_url?: string | null;
  created_at: string;
}

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
          if (response.status === 201) {
            console.log(`[NextAuth] New user created: ${email}, will access dashboard directly`);
          }

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
  } catch (error) {
    console.error(`[NextAuth] Error in findOrCreateUser for ${email}:`, error);

    // If circuit breaker is open, provide more specific error
    if (error.message.includes('Circuit breaker is open')) {
      console.error(`[NextAuth] Circuit breaker is open - authentication temporarily disabled for ${email}`);
    }
  }

  console.error(`[NextAuth] Failed to find/create user for ${email}`);
  return null;
}

// Function to create a trial subscription for new users (delegated to Billing service)
// No longer needed since we're not using trial checkout
// async function createTrialSubscription(email: string, userId: number) {
//   const BILLING_URL = process.env.BILLING_URL
//   const resp = await fetch(`${BILLING_URL}/v1/trials/api-key`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, userId })
//   })
//   if (!BILLING_URL) {
//     throw new Error('Server misconfiguration: BILLING_URL is not set')
//   }
//   if (!resp.ok) {
//     const text = await resp.text()
//     throw new Error(`Billing trial creation failed: ${resp.status} ${text}`)
//   }
//   return await resp.json()
// }

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
  ],
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[NextAuth] signIn callback triggered');
      if (account?.provider === "google" && user.email) {
        console.log(`[NextAuth] Google sign in attempt for: ${user.email}`);
        const dbUser = await findOrCreateUser(user.email, user.name, user.image);
        
        if (!dbUser) {
          console.error(`[NextAuth] Failed to find or create user in DB for ${user.email}. Denying sign in.`);
          return false; // Prevent sign-in if user couldn't be synced with DB
        }
        
        // Add the database user ID to the user object for the JWT callback
        user.id = String(dbUser.id); 
        
        // All users can access the dashboard directly
        console.log(`[NextAuth] User ${user.email} synced with DB ID: ${user.id}. Allowing sign in.`);
        
        return true; // Allow sign-in
      } 
      console.log('[NextAuth] signIn condition not met or email missing.');
      return false; // Deny sign-in for other providers or if email is missing
    },
    async jwt({ token, user }) {
      // Persist the user ID from the user object (added in signIn) to the JWT
      if (user?.id) {
        token.id = user.id;
        console.log(`[NextAuth] JWT callback: Added id ${user.id} to token for email ${token.email}`);
      }
      
      // No need to persist isNewUser flag since we're not using trial checkout
      // if ((user as any)?.isNewUser) {
      //   token.isNewUser = (user as any).isNewUser;
      //   console.log(`[NextAuth] JWT callback: Added isNewUser flag to token for email ${token.email}`);
      // }
      
      return token;
    },
    async session({ session, token }) {
      // Add the user ID from the JWT to the session object
      if (token?.id && session.user) {
        // Important: Ensure you extend the Session and User types if using TypeScript
        // to avoid type errors here.
        (session.user as any).id = token.id;
        console.log(`[NextAuth] Session callback: Added id ${token.id} to session for user ${session.user.email}`);
      }
      
      // No need to check isNewUser flag since we're not using trial checkout
      // New users can access the dashboard directly
      
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for signing JWTs
  // pages: { // Optional: Define custom pages if needed
  //   signIn: '/login',
  //   // error: '/auth/error', // Error code passed in query string as ?error=
  // }
  useSecureCookies: process.env.NODE_ENV === 'production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 