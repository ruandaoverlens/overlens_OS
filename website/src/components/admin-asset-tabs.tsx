"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminAssetTabs({
  showHidden,
  onShowHiddenChange,
  totalCount,
  hiddenCount,
}: {
  showHidden: boolean;
  onShowHiddenChange: (v: boolean) => void;
  totalCount?: number;
  hiddenCount: number;
}) {
  return (
    <div className="px-4 pt-4 max-w-[1920px] mx-auto w-full">
      <Tabs value={showHidden ? "hidden" : "all"} onValueChange={(v) => onShowHiddenChange(v === "hidden")}>
        <TabsList underline>
          <TabsTrigger value="all" className="text-[14px]">Todos{totalCount != null ? ` (${totalCount})` : ""}</TabsTrigger>
          <TabsTrigger value="hidden" className="text-[14px]">Ocultos ({hiddenCount})</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
