-- Chat: anexos (imagens e arquivos) por mensagem.
-- Cada item: { name: string, contentType: string, url: string }
-- url pode ser data URL (base64 inline) ou URL pública/assinada.

alter table public.chat_messages
  add column if not exists attachments jsonb;
