import { type AuthConfig } from "@auth/core";
import { type Provider } from "@auth/core/providers";
import Credentials from "@auth/core/providers/credentials";
import { z } from "zod";
import bcrypt from "bcrypt";
import { sql } from "@vercel/postgres";
import type { User } from "@/app/lib/definitions";

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

const authConfig: AuthConfig = {
  providers: [
    Credentials({
      // Name is required
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const user = await getUser(email);

        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) return user;

        console.log("Invalid credentials");
        return null;
      },
    }) as Provider, // Type assertion to Provider
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { user } = auth || {};
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!user;
      const isOnDashboard = pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
  },
};

export default authConfig;
