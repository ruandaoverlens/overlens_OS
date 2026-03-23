import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  SmHomeSolidIcon,
  SmChatSolidIcon,
  SmCalendarSolidIcon,
  SmPlaySolidIcon,
  SmLibrarySolidIcon,
  SmSettingsLineIcon,
  SmProfileLineIcon,
  SmEmojiSolidIcon,
} from "@/components/icons";
import { Calculator, CreditCard } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "./command";

const meta = {
  title: "Core Components/Command",
  tags: ["autodocs"],
  component: CommandDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Command palette with pill-shaped search input, animated results list, and submit button.",
          "",
          "## Responsive behavior",
          "",
          "| Breakpoint | Layout | Border radius | Shortcuts |",
          "|-----------|--------|---------------|-----------|",
          "| **Mobile** (`< 640px`) | Full-width, top-aligned, full-height | None (square) | Hidden |",
          "| **Desktop** (`≥ 640px`) | Centered, `min-w: 464px`, pill shape | Half input height (28px) | Visible |",
          "",
          "## Suggestions",
          "",
          "Pass the `suggestions` prop to show a default list when the input is empty. When the user types, suggestions hide and `children` are filtered instead.",
          "",
          "## Key details",
          "",
          "- Border radius is calculated dynamically from input height via `ResizeObserver` (default: `28px`)",
          "- `CommandShortcut` is hidden on mobile - no keyboard shortcuts on touch devices",
          "- `CommandDialog` renders full-screen on mobile as a page overlay",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    placeholder: {
      control: "text",
      table: { defaultValue: { summary: "Search..." } },
    },
    children: {
      control: false,
    },
  },
} satisfies Meta<typeof CommandDialog>;

export default meta;
type Story = StoryObj<typeof CommandDialog>;

const pages = [
  { title: "Home", icon: SmHomeSolidIcon },
  { title: "Chat", icon: SmChatSolidIcon },
  { title: "Calendar", icon: SmCalendarSolidIcon },
  { title: "Courses", icon: SmPlaySolidIcon },
  { title: "Library", icon: SmLibrarySolidIcon },
];

const settings = [
  { title: "Profile", icon: SmProfileLineIcon },
  { title: "Settings", icon: SmSettingsLineIcon },
];

export const Default: Story = {
  render: (args) => (
    <div className="max-sm:fixed max-sm:inset-0 max-sm:w-full sm:w-[500px]">
      <Command {...args}>
        <CommandGroup heading="Pages">
          {pages.map((item) => (
            <CommandItem key={item.title}>
              <item.icon />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Settings">
          {settings.map((item) => (
            <CommandItem key={item.title}>
              <item.icon />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await expect(input).toBeVisible();
    await userEvent.click(input);
    await userEvent.type(input, "Profile");
    await expect(canvas.getByText("Profile")).toBeVisible();
  },
};

export const WithSuggestions: Story = {
  render: () => (
    <div className="max-sm:fixed max-sm:inset-0 max-sm:w-full sm:w-[500px]">
      <Command
        suggestions={
          <CommandGroup heading="Sugestões">
            <CommandItem value="Home">
              <SmHomeSolidIcon />
              <span>Home</span>
              <CommandShortcut>Ctrl+H</CommandShortcut>
            </CommandItem>
            <CommandItem value="Chat">
              <SmChatSolidIcon />
              <span>Chat</span>
              <CommandShortcut>Ctrl+M</CommandShortcut>
            </CommandItem>
            <CommandItem value="Courses">
              <SmPlaySolidIcon />
              <span>Courses</span>
              <CommandShortcut>Ctrl+L</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        }
      >
        <CommandGroup heading="Pages">
          {pages.map((item) => (
            <CommandItem key={item.title} value={item.title}>
              <item.icon />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Settings">
          {settings.map((item) => (
            <CommandItem key={item.title} value={item.title}>
              <item.icon />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </div>
  ),
};

export const CustomPlaceholder: Story = {
  render: () => (
    <div className="max-sm:fixed max-sm:inset-0 max-sm:w-full sm:w-[500px]">
      <Command placeholder="Search pages...">
        <CommandGroup heading="Pages">
          {pages.map((item) => (
            <CommandItem key={item.title}>
              <item.icon />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </div>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <div className="max-sm:fixed max-sm:inset-0 max-sm:w-full sm:w-[500px]">
      <Command>
        <CommandGroup heading="Pages">
          {pages.map((item) => (
            <CommandItem key={item.title} value={item.title}>
              <item.icon />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "xyzabc");
    await expect(await canvas.findByText("Nenhum resultado encontrado.")).toBeVisible();
  },
};

export const WithShortcuts: Story = {
  render: () => (
    <div className="max-sm:fixed max-sm:inset-0 max-sm:w-full sm:w-[500px]">
      <Command>
        <CommandGroup heading="Quick actions">
          <CommandItem>
            <SmHomeSolidIcon />
            <span>Go to home</span>
            <CommandShortcut>Ctrl+H</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <SmChatSolidIcon />
            <span>New message</span>
            <CommandShortcut>Ctrl+N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <SmSettingsLineIcon />
            <span>Settings</span>
            <CommandShortcut>Ctrl+,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Recent">
          <CommandItem>
            <SmCalendarSolidIcon />
            <span>Sprint meeting</span>
          </CommandItem>
          <CommandItem>
            <SmLibrarySolidIcon />
            <span>API Documentation</span>
          </CommandItem>
        </CommandGroup>
      </Command>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "Settings");
    await expect(await canvas.findByText("Settings")).toBeVisible();
  },
};

export const WithMixedIcons: Story = {
  render: () => (
    <div className="max-sm:fixed max-sm:inset-0 max-sm:w-full sm:w-[500px]">
      <Command placeholder="Type a command or search...">
        <CommandGroup heading="Suggestions">
          <CommandItem><SmCalendarSolidIcon /> Calendar</CommandItem>
          <CommandItem><SmEmojiSolidIcon /> Search emoji</CommandItem>
          <CommandItem><Calculator /> Calculator</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem><SmProfileLineIcon /> Profile <CommandShortcut>Ctrl+P</CommandShortcut></CommandItem>
          <CommandItem><CreditCard /> Billing <CommandShortcut>Ctrl+B</CommandShortcut></CommandItem>
          <CommandItem><SmSettingsLineIcon /> Settings <CommandShortcut>Ctrl+S</CommandShortcut></CommandItem>
        </CommandGroup>
      </Command>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Default</p>
        <div className="max-sm:fixed max-sm:inset-0 max-sm:w-full sm:w-[500px]">
          <Command>
            <CommandGroup heading="Pages">
              {pages.map((item) => (
                <CommandItem key={item.title}>
                  <item.icon />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Settings">
              {settings.map((item) => (
                <CommandItem key={item.title}>
                  <item.icon />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Custom placeholder</p>
        <div className="max-sm:fixed max-sm:inset-0 max-sm:w-full sm:w-[500px]">
          <Command placeholder="Search pages...">
            <CommandGroup heading="Pages">
              {pages.map((item) => (
                <CommandItem key={item.title}>
                  <item.icon />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>
      </div>
    </div>
  ),
};
