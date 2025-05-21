import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

async function refreshToken(token: any): Promise<any> {
  const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      authorization: `Refresh ${token.tokens.refreshToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) return null;

  const newTokens = await response.json();
  return {
    ...token,
    tokens: newTokens,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!res.ok) return null;

        const { user, tokens, permissions } = await res.json();

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          permissions,
          tokens,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          permissions: user.permissions,
        };
        token.tokens = user.tokens;
        token.permissions = user.permissions;
      }

      if (new Date().getTime() < token.tokens?.expiresIn) return token;
      return await refreshToken(token);
    },

    async session({ token, session }) {
      session.user = token.user;
      session.tokens = token.tokens;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
