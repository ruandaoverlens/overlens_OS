import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthProvider, useAuth, TEST_USERS } from "@/lib/auth";
import { TopbarProfile } from "./topbar-profile";

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
      <TopbarProfileWithAuth email={TEST_USERS.admin.email} />
    </AuthProvider>
  ),
};

export const AsStaff: Story = {
  render: () => (
    <AuthProvider>
      <TopbarProfileWithAuth email={TEST_USERS.staff.email} />
    </AuthProvider>
  ),
};

export const AsAssinante: Story = {
  render: () => (
    <AuthProvider>
      <TopbarProfileWithAuth email={TEST_USERS.assinante.email} />
    </AuthProvider>
  ),
};

export const AsGratuito: Story = {
  render: () => (
    <AuthProvider>
      <TopbarProfileWithAuth email={TEST_USERS.gratuito.email} />
    </AuthProvider>
  ),
};
