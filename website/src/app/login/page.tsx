"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HeadingTitle } from "@/components/ui/heading";
import { FieldError } from "@/components/ui/field";

type Mode = "login" | "signup";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
}

/**
 * Destino pós-login: `?next=` só é aceito se for um caminho relativo seguro
 * (começa com "/" e não com "//", que abriria redirect para outro host).
 */
function getSafeNext(): string {
  if (typeof window === "undefined") return "/docs";
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/docs";
}

function focusField(id: string) {
  document.getElementById(id)?.focus();
}

export default function LoginPage() {
  const { user, loading, login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      window.location.href = getSafeNext();
    }
  }, [user, loading]);

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setErrors({});
  }

  const clearError = (field: keyof FieldErrors) =>
    setErrors((p) => (p[field] || p.form ? { ...p, [field]: undefined, form: undefined } : p));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // Validação por campo: mostra o erro sob o campo e foca o primeiro inválido.
    const next: FieldErrors = {};
    if (mode === "signup" && !name.trim()) next.name = "Preencha seu nome.";
    if (!email.trim()) next.email = "Preencha seu email.";
    else if (!email.includes("@")) next.email = "Informe um email válido.";
    if (!password) next.password = "Preencha sua senha.";
    else if (mode === "signup" && password.length < 6)
      next.password = "A senha deve ter pelo menos 6 caracteres.";
    setErrors(next);
    if (next.name) return focusField("name");
    if (next.email) return focusField("email");
    if (next.password) return focusField("password");

    setSubmitting(true);

    if (mode === "login") {
      const ok = await login(email, password);
      if (ok) {
        window.location.href = getSafeNext();
      } else {
        setErrors({ form: "Email ou senha incorretos." });
        setSubmitting(false);
      }
    } else {
      const result = await signup(email, password, name.trim());
      if (result.success) {
        window.location.href = getSafeNext();
      } else {
        setErrors({ form: result.error ?? "Erro ao criar conta. Tente novamente." });
        setSubmitting(false);
      }
    }
  }

  const disabled = loading || submitting;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center bg-background px-4 outline-none"
    >
      <div className="max-w-sm w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <HeadingTitle as="h1" size="default" className="text-center">
            Overlens
          </HeadingTitle>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Acesse o Brand System" : "Crie sua conta gratuita"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/*
            Enquanto a sessão é verificada só o botão fica inativo: desabilitar o
            fieldset inteiro faria o navegador ignorar o autoFocus dos campos
            (autofocus não se aplica a controle desabilitado).
          */}
          <fieldset disabled={submitting} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  size="sm"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError("name"); }}
                  autoFocus
                  autoComplete="name"
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <FieldError id="name-error" className="text-xs">
                    {errors.name}
                  </FieldError>
                )}
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
                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                autoFocus={mode === "login"}
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <FieldError id="email-error" className="text-xs">
                  {errors.email}
                </FieldError>
              )}
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
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm px-1 text-muted-foreground hover:text-foreground transition-colors text-xs cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {errors.password && (
                <FieldError id="password-error" className="text-xs">
                  {errors.password}
                </FieldError>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={disabled}
              loading={submitting}
              loadingText={mode === "login" ? "Entrando…" : "Criando conta…"}
            >
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </fieldset>

          {errors.form && (
            <FieldError className="pl-0 text-center">{errors.form}</FieldError>
          )}
        </form>

        {/* Toggle */}
        <p className="text-sm text-muted-foreground text-center">
          {mode === "login" ? (
            <>
              Ainda não tem conta?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="text-foreground hover:underline cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-foreground hover:underline cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
