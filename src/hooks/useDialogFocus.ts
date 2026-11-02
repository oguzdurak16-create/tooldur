import { useEffect, useRef, type RefObject } from "react";

// Keep focus inside a dialog and return it to the control that opened it.
export function useDialogFocus(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
  busy = false,
) {
  const close = useRef(onClose);
  const blocked = useRef(busy);
  useEffect(() => {
    close.current = onClose;
    blocked.current = busy;
  }, [onClose, busy]);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
        ),
      ).filter((node) => node.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => {
      if (!dialog.contains(document.activeElement))
        (
          dialog.querySelector<HTMLElement>(
            "input:not([disabled]),textarea:not([disabled])",
          ) ||
          focusable()[0] ||
          dialog
        ).focus();
    });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !blocked.current) {
        event.preventDefault();
        event.stopPropagation();
        close.current();
      }
      if (event.key !== "Tab") return;
      const items = focusable(),
        first = items[0],
        last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [ref]);
}
