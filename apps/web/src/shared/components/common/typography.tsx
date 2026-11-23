import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const headingVariants = cva("", {
  variants: {
    size: {
      sm: "text-sm font-semibold",
      md: "flex items-center gap-2 text-xl font-bold",
      lg: "text-2xl font-bold tracking-tight break-words hyphens-auto md:text-3xl",
      empty: "text-xl font-semibold",
      display: "font-serif text-2xl font-semibold text-balance",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface HeadingProps
  extends
    Omit<React.ComponentProps<"h1">, "children">,
    VariantProps<typeof headingVariants> {
  /** HTML element tag, decoupled from visual `size` for proper document outline. */
  as?: "h1" | "h2" | "h3";
  /** Leading primary-tinted icon (intended for `size="md"`). */
  icon?: LucideIcon;
  children?: React.ReactNode;
}

function Heading({
  as: Component = "h2",
  size,
  icon: Icon,
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Component
      data-slot="heading"
      data-size={size}
      className={cn(headingVariants({ size }), className)}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5 text-primary" />}
      {children}
    </Component>
  );
}

const textVariants = cva("", {
  variants: {
    variant: {
      secondary: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "secondary",
  },
});

interface TextProps
  extends React.ComponentProps<"p">, VariantProps<typeof textVariants> {
  as?: "p" | "span";
}

function Text({
  as: Component = "p",
  variant,
  className,
  ...props
}: TextProps) {
  return (
    <Component
      data-slot="text"
      data-variant={variant}
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Heading, Text };
