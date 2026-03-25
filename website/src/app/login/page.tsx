"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup";

export default function LoginPage() {
  const { user, loading, login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      window.location.href = "/docs";
    }
  }, [user, loading]);

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (mode === "login") {
      const ok = await login(email, password);
      if (ok) {
        window.location.href = "/docs";
      } else {
        setError("Email ou senha incorretos.");
        setSubmitting(false);
      }
    } else {
      if (!name.trim()) {
        setError("Preencha seu nome.");
        setSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        setSubmitting(false);
        return;
      }
      const result = await signup(email, password, name.trim());
      if (result.success) {
        window.location.href = "/docs";
      } else {
        setError(result.error ?? "Erro ao criar conta. Tente novamente.");
        setSubmitting(false);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
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
            {mode === "login" ? "Acesse o Brand System" : "Crie sua conta gratuita"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                size="sm"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          )}

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
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                size="sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs cursor-pointer"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? mode === "login"
                ? "Entrando..."
                : "Criando conta..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </Button>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </form>

        {/* Toggle */}
        <p className="text-sm text-muted-foreground text-center">
          {mode === "login" ? (
            <>
              Ainda nao tem conta?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="text-foreground hover:underline cursor-pointer"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Ja tem uma conta?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-foreground hover:underline cursor-pointer"
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
