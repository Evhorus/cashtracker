"use client";

import { useState } from "react";
import { LucideIcon, MoreVertical } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";

export interface ActionItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ActionsDrawerProps {
  actions: ActionItem[];
  title: string;
  triggerClassName?: string;
}

// Mobile-only drawer (callers wrap in md:hidden; desktop uses inline/hover actions).
export const ActionsDrawer = ({
  actions,
  title,
  triggerClassName,
}: ActionsDrawerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={
          // Reuse title as aria-label for the icon-only trigger.
          <Button
            variant="ghost"
            size="icon"
            aria-label={title}
            className={triggerClassName}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-2 p-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start ${
                  action.variant === "destructive"
                    ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                    : ""
                }`}
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
