import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculadora de Tempo",
};

export default function CalculadoraTempoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
