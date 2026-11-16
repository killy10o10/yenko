import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Sheet heights as fractions of the viewport. The map stays usable above.
 * vaul measures snap points against the window, so the sheet itself is
 * full-height and only its visible fraction changes.
 */
export const SHEET_SNAPS = [0.42, 0.92] as const;

export interface SnapRequest {
  to: "peek" | "full";
  /** Bump to re-issue the same request. */
  id: number;
}

interface Props {
  children: ReactNode;
  /** Sticky bottom area (desktop) or sheet footer (mobile). */
  footer?: ReactNode;
  /** Programmatic sheet position, e.g. drop to peek once routes are on the map. */
  snapRequest?: SnapRequest;
}

/**
 * Desktop: a fixed left column. Mobile: a bottom sheet that snaps between a
 * peek height and nearly full screen, so the map is always one drag away.
 */
export function Panel({ children, footer, snapRequest }: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [snap, setSnap] = useState<number | string | null>(SHEET_SNAPS[0]);

  useEffect(() => {
    if (!snapRequest) return;
    setSnap(snapRequest.to === "full" ? SHEET_SNAPS[1] : SHEET_SNAPS[0]);
  }, [snapRequest]);

  if (isDesktop) {
    return (
      <aside className="absolute inset-y-0 left-0 z-20 flex w-[420px] flex-col border-r bg-card shadow-xl">
        <div className="kente-rule shrink-0" aria-hidden="true" />
        <div className="min-h-0 flex-1 overflow-y-auto pt-20">{children}</div>
        {footer && <div className="shrink-0 border-t bg-card/95 p-4 backdrop-blur">{footer}</div>}
      </aside>
    );
  }

  return (
    <DrawerPrimitive.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={[...SHEET_SNAPS]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Content
          className="fixed inset-x-0 bottom-0 z-40 flex h-[100dvh] flex-col rounded-t-3xl border-t bg-card shadow-2xl outline-none"
          // At the top snap, (1 - snap) of the sheet hangs below the viewport.
          style={{ paddingBottom: `${(1 - SHEET_SNAPS[1]) * 100}dvh` }}
          aria-label="Route planner"
        >
          <DrawerPrimitive.Handle className="mt-2.5 mb-1 !w-12 !bg-border" />
          <div className="kente-rule mx-auto mt-1 w-16 rounded-full" aria-hidden="true" />
          <div
            className="min-h-0 flex-1 overflow-y-auto"
            style={{ overscrollBehavior: "contain" }}
            data-vaul-no-drag={snap === SHEET_SNAPS[1] ? "" : undefined}
          >
            {children}
          </div>
          {footer && <div className="shrink-0 border-t bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">{footer}</div>}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
