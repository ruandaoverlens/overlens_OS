import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthProvider, useAuth, TEST_USERS } from "@/lib/auth";
import { SettingsModal } from "./settings-modal";

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
      <SettingsModalWithAuth email={TEST_USERS.admin.email} />
    </AuthProvider>
  ),
};

export const AsStaff: Story = {
  render: () => (
    <AuthProvider>
      <SettingsModalWithAuth email={TEST_USERS.staff.email} />
    </AuthProvider>
  ),
};

export const AsAssinante: Story = {
  render: () => (
    <AuthProvider>
      <SettingsModalWithAuth email={TEST_USERS.assinante.email} />
    </AuthProvider>
  ),
};

export const AsGratuito: Story = {
  render: () => (
    <AuthProvider>
      <SettingsModalWithAuth email={TEST_USERS.gratuito.email} />
    </AuthProvider>
  ),
};
