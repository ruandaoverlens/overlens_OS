import { useSyncExternalStore } from "react";

// Never changes after mount — the store has no updates to subscribe to.
const subscribe = () => () => {};

/**
 * Returns `false` during SSR and the first client render, then `true` after
 * hydration. Backed by `useSyncExternalStore` (server snapshot = false,
 * client snapshot = true), so it avoids calling `setState` inside an effect —
 * no cascading render and no `react-hooks/set-state-in-effect` warning.
 *
 * Use for hydration guards that previously did:
 *   const [mounted, setMounted] = useState(false);
 *   useEffect(() => setMounted(true), []);
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
