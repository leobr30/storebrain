import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import AuthProvider from "@/provider/auth.provider";
import "flatpickr/dist/themes/light.css";
import "react-datepicker/dist/react-datepicker.css";
import DirectionProvider from "@/provider/direction.provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    const lang = "fr"; // Langue par défaut puisque plus de système multilingue

    return (
        <html lang={lang} className={inter.className}>
            <body>
                <AuthProvider>
                    <TanstackProvider>
                        <Providers>
                            <DirectionProvider lang={lang}>
                                {children}
                            </DirectionProvider>
                        </Providers>
                    </TanstackProvider>
                </AuthProvider>
            </body>
        </html>
    );
}