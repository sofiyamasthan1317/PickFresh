import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-primary-600",
        secondary: "bg-citrus-500 text-white hover:-translate-y-0.5 hover:bg-citrus-600 focus-visible:outline-citrus-500",
        outline: "border border-ink-200 bg-white text-ink-950 hover:border-primary-200 hover:bg-primary-50 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:hover:bg-white/10",
        ghost: "text-ink-700 hover:bg-primary-50 hover:text-primary-700 dark:text-ink-100 dark:hover:bg-white/10 dark:hover:text-white",
        danger: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-14 px-7 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = ({ className, variant, size, asChild, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
};

export const Input = ({ className, ...props }: ComponentProps<"input">) => (
  <input
    className={cn(
      "h-11 w-full rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-950 outline-none transition duration-200 placeholder:text-ink-500/70 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:placeholder:text-ink-100/45 dark:focus:ring-primary-500/20",
      className,
    )}
    {...props}
  />
);

export const Textarea = ({ className, ...props }: ComponentProps<"textarea">) => (
  <textarea
    className={cn(
      "min-h-28 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-950 outline-none transition duration-200 placeholder:text-ink-500/70 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:placeholder:text-ink-100/45 dark:focus:ring-primary-500/20",
      className,
    )}
    {...props}
  />
);

export const Card = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("surface-card rounded-2xl transition duration-200", className)} {...props} />
);

export const Badge = ({ className, ...props }: ComponentProps<"span">) => (
  <span className={cn("inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-100", className)} {...props} />
);

export const Avatar = ({ name, src }: { name: string; src?: string }) => (
  <AvatarPrimitive.Root className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-primary-100 text-sm font-bold text-primary-700">
    <AvatarPrimitive.Image src={src} alt={name} className="h-full w-full object-cover" />
    <AvatarPrimitive.Fallback>{name.slice(0, 2).toUpperCase()}</AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
);

export const Checkbox = ({ checked, onCheckedChange, label }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void; label: string }) => (
  <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-700 dark:text-ink-100">
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={(value) => onCheckedChange?.(value === true)}
    className="grid h-5 w-5 place-items-center rounded-md border border-ink-200 bg-white data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600 dark:border-white/15 dark:bg-ink-900"
    >
      <CheckboxPrimitive.Indicator><Check className="h-3.5 w-3.5 text-white" /></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    {label}
  </label>
);

export const RadioGroup = ({ value, onValueChange, options }: { value: string; onValueChange: (value: string) => void; options: string[] }) => (
  <RadioGroupPrimitive.Root value={value} onValueChange={onValueChange} className="grid gap-3 sm:grid-cols-2">
    {options.map((option) => (
      <label key={option} className="surface-card flex cursor-pointer items-center gap-3 rounded-2xl p-4 text-sm font-medium text-ink-950 dark:text-white">
        <RadioGroupPrimitive.Item value={option} className="h-5 w-5 rounded-full border border-ink-200 dark:border-white/20 data-[state=checked]:border-[6px] data-[state=checked]:border-primary-600" />
        {option}
      </label>
    ))}
  </RadioGroupPrimitive.Root>
);

export const Select = ({ value, onValueChange, options, placeholder, className }: { value: string; onValueChange: (value: string) => void; options: string[]; placeholder: string; className?: string }) => (
  <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
    <SelectPrimitive.Trigger className={cn("flex h-11 w-full items-center justify-between rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-950 dark:border-white/10 dark:bg-ink-900 dark:text-white", className)}>
      <SelectPrimitive.Value placeholder={placeholder} />
      <SelectPrimitive.Icon><ChevronDown className="h-4 w-4" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className="z-50 overflow-hidden rounded-2xl border border-ink-200 bg-white p-1 text-ink-950 shadow-soft dark:border-white/10 dark:bg-ink-900 dark:text-white">
        <SelectPrimitive.Viewport>
          {options.map((option) => (
            <SelectPrimitive.Item key={option} value={option} className="cursor-pointer rounded-xl px-3 py-2 text-sm outline-none hover:bg-primary-50 dark:hover:bg-white/10">
              <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>
            </SelectPrimitive.Item>
          ))}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
);

export const Dialog = ({ title, trigger, children }: { title: string; trigger: ReactNode; children: ReactNode }) => (
  <DialogPrimitive.Root>
    <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm" />
      <DialogPrimitive.Content className="surface-card fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <DialogPrimitive.Title className="text-lg font-bold">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close aria-label="Close" className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export const Drawer = Dialog;
export const Modal = Dialog;

export const Dropdown = ({ trigger, children }: { trigger: ReactNode; children: ReactNode }) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
    <DropdownMenu.Content className="surface-card z-50 min-w-48 rounded-2xl p-2 shadow-soft">
      {children}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
);

export const DropdownItem = ({ children, onSelect }: { children: ReactNode; onSelect?: () => void }) => (
  <DropdownMenu.Item onSelect={onSelect} className="cursor-pointer rounded-xl px-3 py-2 text-sm outline-none hover:bg-primary-50 dark:hover:bg-white/10">
    {children}
  </DropdownMenu.Item>
);

export const Popover = ({ trigger, children }: { trigger: ReactNode; children: ReactNode }) => (
  <PopoverPrimitive.Root>
    <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
    <PopoverPrimitive.Content className="surface-card z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-4 shadow-soft">
      {children}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Root>
);

export const Tooltip = ({ label, children }: { label: string; children: ReactNode }) => (
  <TooltipPrimitive.Provider>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content className="rounded-lg bg-slate-950 px-2 py-1 text-xs text-white">{label}</TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
);

export const Tabs = ({ tabs }: { tabs: { value: string; label: string; content: ReactNode }[] }) => (
  <TabsPrimitive.Root defaultValue={tabs[0]?.value} className="w-full">
    <TabsPrimitive.List className="mb-4 flex flex-wrap gap-2 border-b border-ink-200 pb-3 dark:border-white/10">
      {tabs.map((tab) => (
        <TabsPrimitive.Trigger
          key={tab.value}
          value={tab.value}
          className="rounded-full px-4 py-2 text-sm font-semibold text-ink-500 transition duration-200 hover:text-ink-950 dark:text-ink-100/60 dark:hover:text-white data-[state=active]:bg-primary-600 data-[state=active]:text-white dark:data-[state=active]:bg-primary-600 dark:data-[state=active]:text-white"
        >
          {tab.label}
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
    {tabs.map((tab) => <TabsPrimitive.Content key={tab.value} value={tab.value}>{tab.content}</TabsPrimitive.Content>)}
  </TabsPrimitive.Root>
);

export const Accordion = ({ items }: { items: { title: string; content: ReactNode }[] }) => (
  <AccordionPrimitive.Root type="single" collapsible className="space-y-3">
    {items.map((item) => (
      <AccordionPrimitive.Item key={item.title} value={item.title} className="surface-card rounded-2xl px-5">
        <AccordionPrimitive.Header>
          <AccordionPrimitive.Trigger className="flex w-full items-center justify-between py-4 text-left font-semibold text-ink-950 dark:text-white">
            {item.title}<ChevronDown className="h-4 w-4 shrink-0" />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className="pb-4 text-sm muted-copy">{item.content}</AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    ))}
  </AccordionPrimitive.Root>
);

export const Breadcrumb = ({ items }: { items: string[] }) => (
  <nav aria-label="Breadcrumb" className="text-sm muted-copy">{items.join(" / ")}</nav>
);

export const Pagination = ({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) => (
  <div className="flex items-center justify-center gap-2">
    {Array.from({ length: pages }, (_, index) => index + 1).map((value) => (
      <Button key={value} variant={value === page ? "primary" : "outline"} size="icon" onClick={() => onPage(value)}>{value}</Button>
    ))}
  </div>
);

export const Skeleton = ({ className }: { className?: string }) => <div className={cn("animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10", className)} />;
export const Spinner = () => <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading" />;
export const EmptyState = ({ title, body }: { title: string; body: string }) => <Card className="p-8 text-center"><p className="text-lg font-bold">{title}</p><p className="mt-2 text-sm muted-copy">{body}</p></Card>;
export const ErrorState = ({ title, body }: { title: string; body: string }) => <Card className="border-red-200 bg-red-50 p-8 text-center text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100"><p className="text-lg font-bold">{title}</p><p className="mt-2 text-sm">{body}</p></Card>;
export const LoadingState = () => <div className="grid min-h-72 place-items-center"><Spinner /></div>;

export const SearchInput = ({ value, onChange, onSubmit, placeholder = "Search groceries" }: { value: string; onChange: (value: string) => void; onSubmit?: () => void; placeholder?: string }) => (
  <form
    className="relative w-full"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit?.();
    }}
  >
    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-11" aria-label={placeholder} />
  </form>
);

export const ConfirmDialog = ({ trigger, title, onConfirm }: { trigger: ReactNode; title: string; onConfirm: () => void }) => (
  <Dialog title={title} trigger={trigger}>
    <div className="flex justify-end gap-3">
      <DialogPrimitive.Close asChild><Button variant="outline">Cancel</Button></DialogPrimitive.Close>
      <DialogPrimitive.Close asChild><Button variant="danger" onClick={onConfirm}>Confirm</Button></DialogPrimitive.Close>
    </div>
  </Dialog>
);
