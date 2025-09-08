// Simple types for class values
type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

// Simple clsx alternative
function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const result = clsx(...input);
      if (result) classes.push(result);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  
  return classes.join(' ');
}

// Simple tailwind merge - removes duplicate classes, keeping the last one
function twMerge(classNames: string): string {
  if (!classNames) return '';
  
  const classes = classNames.split(/\s+/).filter(Boolean);
  const classMap = new Map<string, string>();
  
  // Group classes by their base name (before modifiers like :hover, md:, etc.)
  for (const cls of classes) {
    // Extract the base class name (everything before the first modifier)
    const baseClass = cls.split(/[:-]/)[0];
    classMap.set(baseClass, cls);
  }
  
  return Array.from(classMap.values()).join(' ');
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

// Simple implementation of cva (class variance authority) functionality
type VariantProps<T extends (...args: any) => any> = T extends (props: infer P) => any
  ? P
  : never;

interface VariantConfig {
  variants?: Record<string, Record<string, string>>;
  defaultVariants?: Record<string, string>;
}

export function cva(base: string, config?: VariantConfig) {
  return (props?: Record<string, string | undefined>) => {
    const { variants = {}, defaultVariants = {} } = config || {};
    
    let classes = base;
    
    // Apply variant classes
    Object.keys(variants).forEach(variantKey => {
      const variantValue = props?.[variantKey] || defaultVariants[variantKey];
      if (variantValue && variants[variantKey][variantValue]) {
        classes += ` ${variants[variantKey][variantValue]}`;
      }
    });
    
    return classes;
  };
}

// Simple Slot implementation to replace @radix-ui/react-slot
import * as React from "react";

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<any, SlotProps>(
  ({ children, ...props }, ref) => {
    // If children is a single React element, clone it with merged props
    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ...children.props,
        className: cn(props.className, children.props.className),
        style: { ...props.style, ...children.props.style },
        ref: ref || children.ref,
      } as any);
    }
    
    // If multiple children, warn and render in a span
    if (React.Children.count(children) > 1) {
      console.warn("Slot expects a single child element");
      return <span {...props} ref={ref}>{children}</span>;
    }
    
    // Fallback to span wrapper
    return <span {...props} ref={ref}>{children}</span>;
  }
);

Slot.displayName = "Slot";

export type { VariantProps, ClassValue };
