import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  title: "Overlens Brand System",
  description:
    "Documentação completa do sistema de marca da Overlens; escola de Designers Nexialistas.",
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
        <AuthProvider>
          <NotificationsProvider>
            <FavoritesProvider>
              <MusicPlayerProvider>
                <TooltipProvider>
                  {children}
                  <NowPlayingBar />
                  <CurioserScreen />
                  <Toaster position="bottom-right" />
                </TooltipProvider>
              </MusicPlayerProvider>
            </FavoritesProvider>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
