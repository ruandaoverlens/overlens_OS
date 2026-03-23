import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "./combobox";

const meta = {
  title: "Base Components/Combobox",
  tags: ["autodocs"],
  component: Combobox,
  argTypes: {
    multiple: { control: "boolean" },
    onValueChange: { control: false },
    onOpenChange: { control: false },
    onInputValueChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Autocomplete combobox built on Base UI `Combobox` primitives. Supports single and multi-select modes, search filtering, grouped options, chip input, and clear/trigger buttons.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Combobox multiple>",
          "  <ComboboxInput placeholder=\"Search...\" showTrigger showClear />",
          "  <ComboboxContent>",
          "    <ComboboxList>",
          "      <ComboboxEmpty>No results.</ComboboxEmpty>",
          "      <ComboboxGroup>",
          "        <ComboboxLabel>Group</ComboboxLabel>",
          "        <ComboboxItem value=\"item\">Item</ComboboxItem>",
          "      </ComboboxGroup>",
          "      <ComboboxSeparator />",
          "    </ComboboxList>",
          "  </ComboboxContent>",
          "</Combobox>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Combobox` | Root provider. Wraps `@base-ui/react` `Combobox.Root` with an internal anchor context for dropdown positioning |",
          "| `ComboboxInput` | Search input wrapped in `InputGroup`. Props: `showTrigger` (default `true`), `showClear` (default `false`) |",
          "| `ComboboxTrigger` | Chevron toggle button using `SmArrowForwardIosLineIcon` rotated 90 degrees |",
          "| `ComboboxClear` | Clear button using `SmCloseLineIcon` |",
          "| `ComboboxContent` | Floating dropdown panel via `Portal` + `Positioner`. Animated with `animate-in`/`animate-out` |",
          "| `ComboboxList` | Scrollable option list with custom thin scrollbar styling |",
          "| `ComboboxItem` | Selectable option with `SmCheckLineIcon` indicator. Uses `data-highlighted` for keyboard focus |",
          "| `ComboboxGroup` | Groups related options under a `ComboboxLabel` |",
          "| `ComboboxLabel` | Group heading in `font-heading`, `uppercase`, `tracking-wide`, `text-xs` |",
          "| `ComboboxEmpty` | \"No results\" placeholder shown via `group-data-empty/combobox-content:flex` |",
          "| `ComboboxSeparator` | Horizontal divider between groups |",
          "| `ComboboxChips` | Multi-select chip container that acts as an anchor for the dropdown |",
          "| `ComboboxChip` | Removable tag chip. Accepts `showRemove` (default `true`) |",
          "| `ComboboxChipsInput` | Inline text input inside the chips container |",
          "| `ComboboxValue` | Displays the current selection as text |",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "svelte", label: "SvelteKit" },
];

export const Default: Story = {
  render: (args) => (
    <Combobox {...args}>
      <ComboboxInput placeholder="Selecione um framework..." className="w-[200px]" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>Nenhum framework encontrado.</ComboboxEmpty>
          {frameworks.map((fw) => (
            <ComboboxItem key={fw.value} value={fw.value}>
              {fw.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Selecione um framework...");
    await expect(input).toBeInTheDocument();

    await userEvent.click(input);

    const listbox = await within(document.body).findByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    await expect(options.length).toBeGreaterThan(0);

    // Type to filter and verify Next.js is available
    await userEvent.type(input, "Nex");
    await expect(
      within(listbox).getByRole("option", { name: "Next.js" })
    ).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const WithGroups: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Selecione uma ferramenta..." className="w-[200px]" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>Nenhum resultado encontrado.</ComboboxEmpty>
          <ComboboxGroup>
            <ComboboxLabel>Frameworks</ComboboxLabel>
            <ComboboxItem value="next">Next.js</ComboboxItem>
            <ComboboxItem value="remix">Remix</ComboboxItem>
          </ComboboxGroup>
          <ComboboxGroup>
            <ComboboxLabel>Bibliotecas</ComboboxLabel>
            <ComboboxItem value="react">React</ComboboxItem>
            <ComboboxItem value="vue">Vue</ComboboxItem>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Selecione uma ferramenta...");
    await userEvent.click(input);

    const body = within(document.body);
    const listbox = await body.findByRole("listbox");

    // Verify group labels are rendered
    await expect(body.getByText("Frameworks")).toBeInTheDocument();
    await expect(body.getByText("Bibliotecas")).toBeInTheDocument();

    // Verify items from both groups
    await expect(within(listbox).getByRole("option", { name: "Next.js" })).toBeInTheDocument();
    await expect(within(listbox).getByRole("option", { name: "React" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const MultiSelect: Story = {
  render: () => (
    <Combobox multiple>
      <ComboboxInput placeholder="Selecione linguagens..." className="w-[250px]" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>Nenhuma linguagem encontrada.</ComboboxEmpty>
          <ComboboxItem value="typescript">TypeScript</ComboboxItem>
          <ComboboxItem value="javascript">JavaScript</ComboboxItem>
          <ComboboxItem value="python">Python</ComboboxItem>
          <ComboboxItem value="rust">Rust</ComboboxItem>
          <ComboboxItem value="go">Go</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Selecione linguagens...");
    await userEvent.click(input);

    const listbox = await within(document.body).findByRole("listbox");

    const typescriptOption = within(listbox).getByRole("option", { name: "TypeScript" });
    await userEvent.click(typescriptOption);

    const pythonOption = within(listbox).getByRole("option", { name: "Python" });
    await userEvent.click(pythonOption);

    // Verify options are selected (aria-selected)
    await expect(typescriptOption).toHaveAttribute("aria-selected", "true");
    await expect(pythonOption).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{Escape}");
  },
};

export const WithClear: Story = {
  render: () => (
    <Combobox defaultValue="next">
      <ComboboxInput
        placeholder="Select a framework..."
        showClear
        className="w-[250px]"
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          {frameworks.map((fw) => (
            <ComboboxItem key={fw.value} value={fw.value}>
              {fw.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Select a framework...");
    await expect(input).toBeInTheDocument();

    // The clear button should be rendered via ComboboxClear (showClear prop)
    const clearButton = canvasElement.querySelector("[data-slot='combobox-clear']");
    await expect(clearButton).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const WithSeparator: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Select a tool..." className="w-[250px]" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxGroup>
            <ComboboxLabel>Frontend</ComboboxLabel>
            <ComboboxItem value="react">React</ComboboxItem>
            <ComboboxItem value="vue">Vue</ComboboxItem>
          </ComboboxGroup>
          <ComboboxSeparator />
          <ComboboxGroup>
            <ComboboxLabel>Backend</ComboboxLabel>
            <ComboboxItem value="node">Node.js</ComboboxItem>
            <ComboboxItem value="deno">Deno</ComboboxItem>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Select a tool...");
    await userEvent.click(input);

    const body = within(document.body);
    const listbox = await body.findByRole("listbox");

    // Verify both groups render with items
    await expect(body.getByText("Frontend")).toBeInTheDocument();
    await expect(body.getByText("Backend")).toBeInTheDocument();
    await expect(within(listbox).getByRole("option", { name: "React" })).toBeInTheDocument();
    await expect(within(listbox).getByRole("option", { name: "Deno" })).toBeInTheDocument();

    // Verify separator is rendered
    const separator = document.body.querySelector("[data-slot='combobox-separator']");
    await expect(separator).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const EmptyState: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Search frameworks..." className="w-[250px]" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No matching frameworks.</ComboboxEmpty>
          {frameworks.map((fw) => (
            <ComboboxItem key={fw.value} value={fw.value}>
              {fw.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Search frameworks...");
    await userEvent.click(input);

    // Type something that matches nothing
    await userEvent.type(input, "zzzzzzz");

    // Verify the empty state renders
    const emptyEl = document.body.querySelector("[data-slot='combobox-empty']");
    await expect(emptyEl).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

function WithChipsExample() {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(["typescript", "python"]);
  const anchorRef = useComboboxAnchor();

  const languages = [
    { value: "typescript", label: "TypeScript" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "rust", label: "Rust" },
    { value: "go", label: "Go" },
  ];

  return (
    <Combobox multiple value={selectedValues} onValueChange={setSelectedValues}>
      <ComboboxChips ref={anchorRef} className="max-w-[350px]">
        {selectedValues.map((val) => (
          <ComboboxChip key={val}>
            {languages.find((l) => l.value === val)?.label ?? val}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder="Add language..." />
      </ComboboxChips>
      <ComboboxContent anchor={anchorRef}>
        <ComboboxList>
          <ComboboxEmpty>No languages found.</ComboboxEmpty>
          {languages.map((lang) => (
            <ComboboxItem key={lang.value} value={lang.value}>
              {lang.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export const WithChips: Story = {
  render: () => <WithChipsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify chips container is rendered
    const chipsContainer = canvasElement.querySelector("[data-slot='combobox-chips']");
    await expect(chipsContainer).toBeInTheDocument();

    // Verify initial chip elements
    const chips = canvasElement.querySelectorAll("[data-slot='combobox-chip']");
    await expect(chips.length).toBe(2);

    // Verify chip input is present
    const chipInput = canvas.getByPlaceholderText("Add language...");
    await expect(chipInput).toBeInTheDocument();

    // Open dropdown by clicking the chip input
    await userEvent.click(chipInput);

    const body = within(document.body);
    const listbox = await body.findByRole("listbox");

    // Select an additional item
    const rustOption = within(listbox).getByRole("option", { name: "Rust" });
    await userEvent.click(rustOption);

    // Verify a new chip appeared
    const updatedChips = canvasElement.querySelectorAll("[data-slot='combobox-chip']");
    await expect(updatedChips.length).toBe(3);

    await userEvent.keyboard("{Escape}");
  },
};



function WithChipsNoRemoveExample() {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(["typescript"]);
  const anchorRef = useComboboxAnchor();

  return (
    <Combobox multiple value={selectedValues} onValueChange={setSelectedValues}>
      <ComboboxChips ref={anchorRef} className="max-w-[350px]">
        {selectedValues.map((val) => (
          <ComboboxChip key={val} showRemove={false}>
            {val}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder="Type to search..." />
      </ComboboxChips>
      <ComboboxContent anchor={anchorRef}>
        <ComboboxList>
          <ComboboxEmpty>Nothing found.</ComboboxEmpty>
          <ComboboxItem value="typescript">TypeScript</ComboboxItem>
          <ComboboxItem value="python">Python</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export const WithChipsNoRemove: Story = {
  render: () => <WithChipsNoRemoveExample />,
  play: async ({ canvasElement }) => {
    // Verify chip exists but has no remove button
    const chips = canvasElement.querySelectorAll("[data-slot='combobox-chip']");
    await expect(chips.length).toBe(1);

    const removeButtons = canvasElement.querySelectorAll("[data-slot='combobox-chip-remove']");
    await expect(removeButtons.length).toBe(0);

    await userEvent.keyboard("{Escape}");
  },
};

export const WithTriggerOnly: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput
        placeholder="Pick a framework..."
        showTrigger
        showClear={false}
        className="w-[250px]"
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No results.</ComboboxEmpty>
          {frameworks.map((fw) => (
            <ComboboxItem key={fw.value} value={fw.value}>
              {fw.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    // Verify trigger icon is rendered
    const trigger = canvasElement.querySelector("[data-slot='combobox-trigger']");
    await expect(trigger).toBeInTheDocument();

    // Verify no clear button
    const clear = canvasElement.querySelector("[data-slot='combobox-clear']");
    await expect(clear).not.toBeInTheDocument();

    // Click trigger to open dropdown
    await userEvent.click(trigger!);

    const listbox = await within(document.body).findByRole("listbox");
    await expect(within(listbox).getAllByRole("option").length).toBe(5);

    await userEvent.keyboard("{Escape}");
  },
};

export const WithValue: Story = {
  render: () => (
    <Combobox defaultValue="astro">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground pl-2">Selected:</span>
        <ComboboxValue />
      </div>
      <ComboboxInput placeholder="Change framework..." className="w-[250px]" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No results.</ComboboxEmpty>
          {frameworks.map((fw) => (
            <ComboboxItem key={fw.value} value={fw.value}>
              {fw.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ComboboxValue renders as a React.Fragment (no own DOM element),
    // so verify the selected value text appears next to the "Selected:" label.
    await expect(canvas.getByText("Selected:")).toBeInTheDocument();
    await expect(canvas.getByText(/astro/i)).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const NoTrigger: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput
        placeholder="Search without trigger..."
        showTrigger={false}
        className="w-[250px]"
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No results.</ComboboxEmpty>
          {frameworks.map((fw) => (
            <ComboboxItem key={fw.value} value={fw.value}>
              {fw.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify no trigger button is rendered
    const trigger = canvasElement.querySelector("[data-slot='combobox-trigger']");
    await expect(trigger).not.toBeInTheDocument();

    // Input should still work to open dropdown
    const input = canvas.getByPlaceholderText("Search without trigger...");
    await userEvent.click(input);
    await userEvent.type(input, "Nex");

    const listbox = await within(document.body).findByRole("listbox");
    await expect(within(listbox).getByRole("option", { name: "Next.js" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const WithClearAndTrigger: Story = {
  render: () => (
    <Combobox defaultValue="remix">
      <ComboboxInput
        placeholder="Select framework..."
        showTrigger
        showClear
        className="w-[250px]"
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No results.</ComboboxEmpty>
          {frameworks.map((fw) => (
            <ComboboxItem key={fw.value} value={fw.value}>
              {fw.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    // Both trigger and clear should be present
    const trigger = canvasElement.querySelector("[data-slot='combobox-trigger']");
    await expect(trigger).toBeInTheDocument();

    const clear = canvasElement.querySelector("[data-slot='combobox-clear']");
    await expect(clear).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

const manyItems = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "svelte", label: "SvelteKit" },
  { value: "gatsby", label: "Gatsby" },
  { value: "angular", label: "Angular" },
  { value: "solid", label: "SolidJS" },
  { value: "qwik", label: "Qwik" },
  { value: "ember", label: "Ember.js" },
  { value: "preact", label: "Preact" },
  { value: "lit", label: "Lit" },
  { value: "alpine", label: "Alpine.js" },
  { value: "htmx", label: "htmx" },
  { value: "fresh", label: "Fresh" },
];

/** Combobox with many items to validate scroll behavior. */
export const WithScroll: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Selecione um framework..." className="w-[250px]" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>Nenhum resultado encontrado.</ComboboxEmpty>
          {manyItems.map((item) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Selecione um framework...");
    await userEvent.click(input);

    const listbox = await within(document.body).findByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    await expect(options.length).toBe(15);

    await userEvent.keyboard("{Escape}");
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Padrao</p>
        <Combobox>
          <ComboboxInput placeholder="Selecione um framework..." className="w-[200px]" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty>Nenhum framework encontrado.</ComboboxEmpty>
              {frameworks.map((fw) => (
                <ComboboxItem key={fw.value} value={fw.value}>
                  {fw.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Com grupos</p>
        <Combobox>
          <ComboboxInput placeholder="Selecione uma ferramenta..." className="w-[200px]" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty>Nenhum resultado encontrado.</ComboboxEmpty>
              <ComboboxGroup>
                <ComboboxLabel>Frameworks</ComboboxLabel>
                <ComboboxItem value="next">Next.js</ComboboxItem>
                <ComboboxItem value="remix">Remix</ComboboxItem>
              </ComboboxGroup>
              <ComboboxGroup>
                <ComboboxLabel>Bibliotecas</ComboboxLabel>
                <ComboboxItem value="react">React</ComboboxItem>
                <ComboboxItem value="vue">Vue</ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Multipla selecao</p>
        <Combobox multiple>
          <ComboboxInput placeholder="Selecione linguagens..." className="w-[250px]" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty>Nenhuma linguagem encontrada.</ComboboxEmpty>
              <ComboboxItem value="typescript">TypeScript</ComboboxItem>
              <ComboboxItem value="javascript">JavaScript</ComboboxItem>
              <ComboboxItem value="python">Python</ComboboxItem>
              <ComboboxItem value="rust">Rust</ComboboxItem>
              <ComboboxItem value="go">Go</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  ),
};
