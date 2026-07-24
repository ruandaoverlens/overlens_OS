import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthProvider, useAuth } from "@/lib/auth";
import { TopbarProfile } from "./topbar-profile";

// Emails de exemplo apenas para ilustrar os stories — sem credenciais reais.
const MOCK_EMAILS = {
  admin: "exemplo.admin@overlens.com.br",
  staff: "exemplo.staff@overlens.com.br",
  assinante: "exemplo.assinante@overlens.com.br",
  gratuito: "exemplo.visitante@overlens.com.br",
} as const;

const meta = {
  title: "Components/TopbarProfile",
  component: TopbarProfile,
  parameters: {
    docs: {
      description: {
        component:
          "Avatar com dropdown de perfil exibido na topbar. Mostra iniciais do usuário e oferece acesso a Configurações e Desconectar.",
      },
    },
  },
} satisfies Meta<typeof TopbarProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

function TopbarProfileWithAuth({ email }: { email: string }) {
  const { login, user } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) await login(email, "password");
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [email, login, user]);

  if (!ready || !user) return null;

  return <TopbarProfile />;
}

export const AsAdmin: Story = {
  render: () => (
    <AuthProvider>
      <TopbarProfileWithAuth email={MOCK_EMAILS.admin} />
    </AuthProvider>
  ),
};

export const AsStaff: Story = {
  render: () => (
    <AuthProvider>
      <TopbarProfileWithAuth email={MOCK_EMAILS.staff} />
    </AuthProvider>
  ),
};

export const AsAssinante: Story = {
  render: () => (
    <AuthProvider>
      <TopbarProfileWithAuth email={MOCK_EMAILS.assinante} />
    </AuthProvider>
  ),
};

export const AsGratuito: Story = {
  render: () => (
    <AuthProvider>
      <TopbarProfileWithAuth email={MOCK_EMAILS.gratuito} />
    </AuthProvider>
  ),
};
