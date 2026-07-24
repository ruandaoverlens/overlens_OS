import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthProvider, useAuth } from "@/lib/auth";
import { SettingsModal } from "./settings-modal";

// Emails de exemplo apenas para ilustrar os stories — sem credenciais reais.
const MOCK_EMAILS = {
  admin: "exemplo.admin@overlens.com.br",
  staff: "exemplo.staff@overlens.com.br",
  assinante: "exemplo.assinante@overlens.com.br",
  gratuito: "exemplo.visitante@overlens.com.br",
} as const;

const meta = {
  title: "Components/SettingsModal",
  component: SettingsModal,
  parameters: {
    docs: {
      description: {
        component:
          "Modal de configurações com navegação lateral. Abas: Conta, Segurança, Aplicativos e Membros (admin).",
      },
    },
  },
} satisfies Meta<typeof SettingsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

function SettingsModalWithAuth({ email }: { email: string }) {
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

  return <SettingsModal open={true} onOpenChange={() => {}} />;
}

export const AsAdmin: Story = {
  render: () => (
    <AuthProvider>
      <SettingsModalWithAuth email={MOCK_EMAILS.admin} />
    </AuthProvider>
  ),
};

export const AsStaff: Story = {
  render: () => (
    <AuthProvider>
      <SettingsModalWithAuth email={MOCK_EMAILS.staff} />
    </AuthProvider>
  ),
};

export const AsAssinante: Story = {
  render: () => (
    <AuthProvider>
      <SettingsModalWithAuth email={MOCK_EMAILS.assinante} />
    </AuthProvider>
  ),
};

export const AsGratuito: Story = {
  render: () => (
    <AuthProvider>
      <SettingsModalWithAuth email={MOCK_EMAILS.gratuito} />
    </AuthProvider>
  ),
};
