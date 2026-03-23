"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, TEST_USERS, getRoleLabel, type UserRole } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/docs");
    }
  }, [user, router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const success = login(email, password);
    if (success) {
      router.push("/docs");
    } else {
      setError("Email ou senha incorretos.");
    }
  }

  function handleTestUserLogin(role: UserRole) {
    const testUser = TEST_USERS[role];
    setEmail(testUser.email);
    setError("");
    const success = login(testUser.email, "test");
    if (success) {
      router.push("/docs");
    }
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="font-heading text-2xl uppercase tracking-wide text-foreground">
            Overlens
          </h1>
          <p className="text-sm text-muted-foreground">
            Acesse o Brand System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              size="sm"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              size="sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Entrar
          </Button>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </form>

        {/* Test Users */}
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground text-center">
            Usuários de teste
          </p>
          <div className="grid gap-2">
            {(Object.keys(TEST_USERS) as UserRole[]).map((role) => {
              const u = TEST_USERS[role];
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleTestUserLogin(role)}
                  className="flex flex-col items-start rounded-lg border border-foreground/10 px-3 py-2 text-left transition-colors hover:bg-accent/50"
                >
                  <span className="text-sm font-medium text-foreground">
                    {u.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {u.email} &middot; {getRoleLabel(u.role)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
