"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Tema da plataforma. Escreve `light`/`dark` como classe no `<html>` — é essa
 * classe que liga os blocos `:root` e `.dark` de `globals.css`.
 *
 * O padrão é `dark`: a Overlens nasceu escura e ninguém deve ver a plataforma
 * mudar de cara sozinha. `enableSystem` mantém "Sistema" como uma escolha
 * possível no seletor, não como o estado inicial. A preferência fica em
 * `localStorage` sob `overlens-theme`.
 *
 * `disableTransitionOnChange` desliga as transições de cor durante a troca:
 * sem isso, cada superfície da página anima em ritmo próprio e a troca vira
 * um borrão de meio segundo.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="overlens-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
