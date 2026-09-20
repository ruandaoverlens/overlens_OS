/**
 * Receitas de classe compartilhadas entre os menus (dropdown, context, menubar,
 * select, combobox, command, drawer).
 *
 * Antes desta extração havia 7 cópias da receita de "rótulo de grupo" e 4 da
 * receita de "atalho de teclado", que foram divergindo entre si (o `command`
 * escondia o atalho abaixo de `sm`). Mantenha a aparência aqui; nos componentes
 * fica apenas o que é específico deles (espaçamento, `data-[inset]`, etc.).
 */

/** Rótulo de um grupo de itens de menu: Outfit, caixa alta, muted. */
export const menuGroupLabelClasses =
  "text-muted-foreground font-heading uppercase tracking-wide text-xs"

/**
 * Mesma receita para o `cmdk`, que estiliza o cabeçalho por seletor
 * descendente em vez de um componente próprio.
 */
export const cmdkGroupLabelClasses =
  "[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:font-heading [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-xs"

/**
 * Atalho de teclado alinhado à direita do item de menu. Fica visível em
 * qualquer largura: esconder o atalho no mobile só some com a informação, já
 * que ele não ocupa linha própria.
 */
export const menuShortcutClasses =
  "text-muted-foreground ml-auto text-xs font-mono uppercase tracking-widest"
