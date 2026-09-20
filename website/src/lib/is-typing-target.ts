/**
 * Indica se o alvo de um evento de teclado é um campo de digitação
 * (input, textarea, select, contentEditable ou `role="textbox"`).
 * Use para não disparar atalhos globais enquanto o usuário digita.
 */
export function isTypingTarget(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false
  const tag = el.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if (el.isContentEditable) return true
  if (el.getAttribute("role") === "textbox") return true
  return el.closest('[contenteditable="true"], [role="textbox"]') !== null
}
