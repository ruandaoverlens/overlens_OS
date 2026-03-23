"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SmSettingsLineIcon, SmLogoutLineIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { SettingsModal } from "@/components/settings-modal";

function getInitials(name?: string): string {
  if (!name) return "OV";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? "OV";
}

export function TopbarProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  if (!hasMounted || !user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full outline-none transition-opacity hover:opacity-80">
            <Avatar size="sm">
              <AvatarImage src={user.avatarUrl ?? ""} alt="Perfil" />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-48">
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <SmSettingsLineIcon />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <SmLogoutLineIcon />
            <span>Desconectar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
