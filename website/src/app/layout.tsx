import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { AuthProvider } from "@/lib/auth";
import { MusicPlayerProvider } from "@/lib/music-player";
import { FavoritesProvider } from "@/lib/favorites";
import { NotificationsProvider } from "@/lib/notifications";
import { Toaster } from "@/components/ui/sonner";
import { NowPlayingBar } from "@/components/now-playing-bar";
import { CurioserScreen } from "@/components/curioser-screen";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://overlens-os.vercel.app"),
  title: { default: "Overlens OS", template: "%s · Overlens OS" },
  description:
    "Sistema operacional da Overlens: brand system, assets, micélio e registros da escola de Empreendedores Nexialistas.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} font-body antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo
        </a>
        <AuthProvider>
          <NotificationsProvider>
            <FavoritesProvider>
              <MusicPlayerProvider>
                <TooltipProvider>
                  <ConfirmProvider>
                    {children}
                    <NowPlayingBar />
                    <CurioserScreen />
                    <Toaster position="bottom-right" />
                  </ConfirmProvider>
                </TooltipProvider>
              </MusicPlayerProvider>
            </FavoritesProvider>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
