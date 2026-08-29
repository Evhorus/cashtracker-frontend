import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Same cva-variants shape button.tsx already uses for its own
// variant/size axes - Heading follows that established convention
// rather than a one-off object lookup. (Not a shadcn pattern, for what
// it's worth: shadcn's own "Typography" registry items are separate
// hardcoded demo files per level - TypographyH1, TypographyMuted... -
// each just a plain `<h1 className="...">` meant to be copy-pasted and
// adjusted per use, consistent with shadcn's "you own the code, no
// abstraction" philosophy. A sizeable Heading is a different, equally
// valid convention - Radix Themes/Chakra/Mantine all do this - just not
// shadcn's; cva is what makes it feel native to this codebase instead.)
const headingVariants = cva("", {
  variants: {
    size: {
      // "Sobres en alerta" / "Actividad reciente" - a small dashboard
      // tile/widget's own title, sitting next to others.
      sm: "text-sm font-semibold",
      // "Historial de Gastos" - a whole page section's title, outside
      // any Card (CardTitle covers the inside-a-Card case). `icon`
      // below is meant for this size.
      md: "flex items-center gap-2 text-xl font-bold",
      // The dashboard page-title style - what PageHeader itself renders
      // its `title` prop as. Any page that (for now) can't route its
      // title through PageHeader still matches it exactly instead of
      // hand-copying the classes - e.g. dashboard's greeting and
      // Estadísticas' title, which have their own layout PageHeader
      // doesn't fit (no backUrl/actions, a two-line "date + Hola, X"
      // block).
      lg: "text-2xl font-bold tracking-tight break-words md:text-3xl",
      // An empty state's own heading ("Sin resultados para X", "Aún no
      // hay gastos"). Lighter than `md` on purpose - it sits inside a
      // card that's already the only thing on screen, so it doesn't need
      // to compete for attention the way a section title does. Was
      // hand-copied as `text-xl font-semibold` at four separate call
      // sites before EmptyState centralized them.
      empty: "text-xl font-semibold",
      // The editorial first-run heading ("Organiza tus gastos por
      // sobres") - the serif display face, used only where an empty
      // state is somebody's actual first screen in the app and is
      // meant to read like a sentence rather than a status message.
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
  /** Which HTML element to render - independent of `size`, so a
   * visually-sm heading can still be a real h2 for document outline
   * purposes. Defaults to h2, the most common case (a heading inside a
   * page, not the page's own h1). */
  as?: "h1" | "h2" | "h3";
  /** Leading icon, tinted `text-primary` - e.g. the $ before "Historial
   * de Gastos". Only really meant for size="md"; other sizes don't use
   * an icon anywhere today. */
  icon?: LucideIcon;
  children?: React.ReactNode;
}

/**
 * One heading component for every non-Card heading role in the app
 * (Card's own internal heading is CardTitle, unrelated), sized via
 * `size` rather than having a separately-named component per role - each
 * role used to be hand-copied at its call sites with small drift (bold
 * vs semibold, with/without the icon gap...); this is the one place
 * those styles live now.
 */
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

// Same reasoning as headingVariants above: one axis (`variant`) instead of
// a separately-named component per role. Only one role is implemented
// today - "secondary" ("subordinate to the main content next to it": a
// form hint, empty-state copy, a card's meta line, dialog copy... - named
// for that role, not for text-muted-foreground, the technique that
// happens to render it). Not called "description" - this app's own
// domain objects already have a real `description` field
// (Expense.description...), and that word here would read like it's
// about that instead of being a generic role name. More variants (e.g. a
// "lead" paragraph, shadcn's TypographyLead) can join this map later
// without another component.
const textVariants = cva("", {
  variants: {
    variant: {
      // Same idea as Card's own CardDescription, just for text living
      // outside a Card.
      secondary: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "secondary",
  },
});

interface TextProps
  extends React.ComponentProps<"p">, VariantProps<typeof textVariants> {
  /** Render as a <span> instead of a <p> for inline use (e.g. next to
   * another inline element) - same text style either way. */
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
