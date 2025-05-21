import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: number;
            username: string;
            name: string;
            email: string;
            permissions: { action: string; subject: string }[];
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }

    interface User {
        id: number;
        username: string;
        name: string;
        email: string;
        permissions: { action: string; subject: string }[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user: {
            id: number;
            username: string;
            name: string;
            email: string;
            permissions: { action: string; subject: string }[];
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
        permissions: { action: string; subject: string }[];
    }
}
