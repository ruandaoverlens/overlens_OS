"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SmSettingsLineIcon, SmLogoutLineIcon } from "@/components/icons";
import { useAuth, getRoleLabel } from "@/lib/auth";
import { SettingsModal } from "@/components/settings-modal";

function getInitials(name?: string): string {
  if (!name) return "OV";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? "OV";
}

export function SidebarProfile() {
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => setHasMounted(true), []);

  if (!hasMounted) return null;

  const handleLogout = async () => {
    setLoggingOut(true);
    await Promise.race([
      logout().catch(() => {}),
      new Promise((r) => setTimeout(r, 2000)),
    ]);
    window.location.replace("/login");
  };

  const displayName = user?.name ?? "Convidado";
  const subtitle = user ? getRoleLabel(user.role) : "Não autenticado";

  return (
    <>
      <DropdownMenu>
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-sidebar to-transparent"
          />
          <DropdownMenuTrigger asChild>
            <button className="relative flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Avatar size="sm">
                <AvatarImage src={user?.avatarUrl ?? ""} alt="Perfil" />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium text-foreground">
                  {displayName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {subtitle}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56">
          <div className="flex items-center gap-2 px-2 pt-1 pb-2">
            <Avatar size="sm">
              <AvatarImage src={user?.avatarUrl ?? ""} alt="Perfil" />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col justify-center leading-tight">
              <span className="truncate text-sm font-medium text-foreground">
                {displayName}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <SmSettingsLineIcon />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
            <SmLogoutLineIcon />
            <span>{loggingOut ? "Saindo..." : "Desconectar"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
