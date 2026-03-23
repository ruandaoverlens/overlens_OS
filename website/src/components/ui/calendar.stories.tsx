import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import * as React from "react";
import { Calendar } from "./calendar";

const meta = {
  title: "Core Components/Calendar",
  tags: ["autodocs"],
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component: [
          "Date picker calendar built on `react-day-picker` v9 with Radix-style composability.",
          "",
          "## Modes",
          "",
          "| Prop | Values | Behavior |",
          "|------|--------|----------|",
          "| `mode` | `single` | Select one date |",
          "| `mode` | `range` | Select a start and end date |",
          "| `captionLayout` | `label` | Static month/year label (default) |",
          "| `captionLayout` | `dropdown` | Month/year dropdowns - on mobile triggers native OS picker via `<select>` |",
          "| `numberOfMonths` | `number` | Side-by-side calendars (stacks vertically on mobile) |",
          "| `showOutsideDays` | `boolean` | Show days from adjacent months (default: `true`) |",
          "",
          "## Selection styles",
          "",
          "| State | Visual |",
          "|-------|--------|",
          "| Single selected | `bg-primary` filled circle |",
          "| Range start/end | `border-2 border-surface-300` ring, transparent fill |",
          "| Range middle | `bg-surface-950` band, no border |",
          "| Today | `bg-white/10`, hover inverts to `bg-white text-background` |",
          "",
          "## Locale",
          "",
          "Defaults to `pt-BR` via `date-fns/locale`. Month dropdown uses short format (`jan`, `fev`, etc.).",
          "",
          "## Key details",
          "",
          "- Day buttons are round (`rounded-full`) with `aspect-square`",
          "- Cell size controlled via `--cell-size` CSS variable (`--spacing(8)` = 32px)",
          "- Navigation arrows use custom icons (`SmArrowBackIosNewLineIcon`, `SmArrowForwardIosLineIcon`)",
          "- Dropdown mode uses native `<select>` with `opacity-0` overlay pattern - mobile devices trigger their native picker UI",
          "- Multiple months stack `flex-col` on mobile, `flex-row` on desktop",
          "- `fromYear` / `toYear` required with `captionLayout=\"dropdown\"` to bound the year range",
          "- Disabled state grays out all days with `opacity-50`",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    showOutsideDays: { control: "boolean" },
    numberOfMonths: { control: "number" },
    captionLayout: {
      control: "select",
      options: ["label", "dropdown"],
    },
    onSelect: { control: false },
    onMonthChange: { control: false },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const calendar = canvasElement.querySelector("[data-slot='calendar']");
    await expect(calendar).toBeInTheDocument();

    const dayButtons = canvas.getAllByRole("button").filter(
      (btn) => btn.closest("td") !== null
    );
    await expect(dayButtons.length).toBeGreaterThan(0);

    // Find an unselected day and click it
    const targetDay = dayButtons.find(
      (btn) => btn.getAttribute("data-selected-single") !== "true"
    );
    if (targetDay) {
      const dayLabel = targetDay.textContent;
      await userEvent.click(targetDay);

      // Re-query the button after React re-render
      const updatedButtons = canvas.getAllByRole("button").filter(
        (btn) => btn.closest("td") !== null && btn.textContent === dayLabel
      );
      await expect(updatedButtons[0]?.getAttribute("data-selected-single")).toBe("true");
    }
  },
};

export const Range: Story = {
  render: () => {
    const [range, setRange] = React.useState<{ from: Date; to?: Date } | undefined>(undefined);
    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={(_r: any, day: Date) => {
          if (!range || (range.from && range.to)) {
            setRange({ from: day });
          } else {
            setRange(_r);
          }
        }}
        numberOfMonths={2}
        className="rounded-md border"
      />
    );
  },
};

export const WithDropdown: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        captionLayout="dropdown"
        fromYear={2020}
        toYear={2030}
        className="rounded-md border"
      />
    );
  },
};

export const MultipleMonths: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        numberOfMonths={2}
        className="rounded-md border"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled
        className="rounded-md border"
      />
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const [singleDate, setSingleDate] = React.useState<Date | undefined>(new Date());
    const [rangeDate, setRangeDate] = React.useState<{ from: Date; to?: Date } | undefined>(undefined);
    const [dropdownDate, setDropdownDate] = React.useState<Date | undefined>(new Date());
    const [multiDate, setMultiDate] = React.useState<Date | undefined>(new Date());

    return (
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Data única</p>
          <Calendar
            mode="single"
            selected={singleDate}
            onSelect={setSingleDate}
            className="rounded-md border"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Intervalo de datas</p>
          <Calendar
            mode="range"
            selected={rangeDate}
            onSelect={(_r: any, day: Date) => {
              if (!rangeDate || (rangeDate.from && rangeDate.to)) {
                setRangeDate({ from: day });
              } else {
                setRangeDate(_r);
              }
            }}
            numberOfMonths={2}
            className="rounded-md border"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Com dropdown</p>
          <Calendar
            mode="single"
            selected={dropdownDate}
            onSelect={setDropdownDate}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={2030}
            className="rounded-md border"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Múltiplos meses</p>
          <Calendar
            mode="single"
            selected={multiDate}
            onSelect={setMultiDate}
            numberOfMonths={2}
            className="rounded-md border"
          />
        </div>
      </div>
    );
  },
};
