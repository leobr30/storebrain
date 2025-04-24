import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";



async function refreshToken(token: any): Promise<any> {
  console.log("♻️ API_URL dans refreshToken :", process.env.API_URL);
  const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      authorization: `Refresh ${token.tokens.refreshToken}`,
      "Content-Type": 'application/json'
    }
  })
  if (!response.ok) {
    return null
  }

  return {
    ...token,
    tokens: await response.json(),
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
        const { username, password } = credentials as {
          username: string,
          password: string,
        };

        console.log("🔧 API_URL dans authorize :", process.env.API_URL);

        if (!credentials?.username || !credentials?.password) return null;
        const res = await fetch(`${process.env.API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ username, password })
        })
        if (!res.ok) {
          return null
        }
        return res.json();
      }

    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      //Login        
      if (user) return { ...token, ...user };

      if (new Date().getTime() < token.tokens.expiresIn) return token;
      return await refreshToken(token);
    },
    async session({ token, session }) {
      session.user = token.user;
      session.tokens = token.tokens

      return session;
    }
  },
})
