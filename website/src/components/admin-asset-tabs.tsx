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
    <div className="container-content pt-4">
      <Tabs value={showHidden ? "hidden" : "all"} onValueChange={(v) => onShowHiddenChange(v === "hidden")}>
        <TabsList underline>
          <TabsTrigger value="all" className="text-sm">Todos{totalCount != null ? ` (${totalCount})` : ""}</TabsTrigger>
          <TabsTrigger value="hidden" className="text-sm">Ocultos ({hiddenCount})</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
