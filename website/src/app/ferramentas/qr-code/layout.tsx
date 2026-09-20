import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerador de QR Code",
};

export default function QrCodeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
