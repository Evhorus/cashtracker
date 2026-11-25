"use client";

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { useIsDesktop } from "@/shared/hooks/use-media-query";

interface ResponsiveFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit when fully controlled from outside (e.g. opened from a card actions menu). */
  trigger?: React.ReactElement;
  title: string;
  description: React.ReactNode;
  dialogClassName?: string;
  children: React.ReactNode;
}

/** Roughly how long a phone's on-screen keyboard takes to slide in. */
const KEYBOARD_OPEN_DELAY_MS = 300;

/** Scrolls focused text inputs into view after the mobile on-screen keyboard animates in inside the bottom drawer. */
function keepFocusedFieldVisible(event: React.FocusEvent<HTMLDivElement>) {
  const field = event.target;
  if (!(
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement ||
    field instanceof HTMLSelectElement
  )) {
    return;
  }

  window.setTimeout(() => {
    if (document.activeElement === field) {
      field.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, KEYBOARD_OPEN_DELAY_MS);
}

// Dialog on desktop, scrollable bottom Drawer on mobile (DrawerContent does not scroll on its own).
export function ResponsiveFormSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  dialogClassName,
  children,
}: ResponsiveFormSheetProps) {
  const t = useTranslations("common");
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger render={trigger} />}
        <DialogContent className={dialogClassName}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      {trigger && <DrawerTrigger render={trigger} />}
      <DrawerContent>
        <DrawerHeader className="relative text-left">
          <DrawerTitle className="pr-8">{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-4 right-4"
              />
            }
          >
            <XIcon />
            <span className="sr-only">{t("close")}</span>
          </DrawerClose>
        </DrawerHeader>
        <div
          className="flex-1 overflow-y-auto px-4 pb-4"
          data-base-ui-swipe-ignore
          onFocus={keepFocusedFieldVisible}
        >
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
