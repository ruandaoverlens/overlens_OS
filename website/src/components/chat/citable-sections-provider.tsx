"use client";

import * as React from "react";
import type { CitableSection } from "@/lib/citable-sections";

type CitableSectionsContextValue = {
  citableSections: CitableSection[];
  basePath: string;
};

const CitableSectionsContext =
  React.createContext<CitableSectionsContextValue | null>(null);

export function CitableSectionsProvider({
  citableSections,
  basePath,
  children,
}: {
  citableSections: CitableSection[];
  basePath: string;
  children: React.ReactNode;
}) {
  const value = React.useMemo<CitableSectionsContextValue>(
    () => ({ citableSections, basePath }),
    [citableSections, basePath],
  );
  return (
    <CitableSectionsContext.Provider value={value}>
      {children}
    </CitableSectionsContext.Provider>
  );
}

export function useCitableSections(): CitableSectionsContextValue {
  const ctx = React.useContext(CitableSectionsContext);
  if (!ctx) {
    return { citableSections: [], basePath: "" };
  }
  return ctx;
}
