"use client";

import * as React from "react";
import { cn } from "./utils";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({
  className,
  checked,
  onCheckedChange,
  onChange,
  ...props
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
    onChange?.(e);
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        data-slot="checkbox"
        className={cn(
          "peer sr-only"
        )}
        checked={checked}
        onChange={handleChange}
        {...props}
      />
      <div
        className={cn(
          "peer border bg-input-background dark:bg-input/30 peer-checked:bg-primary peer-checked:text-primary-foreground dark:peer-checked:bg-primary peer-checked:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-all outline-none peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 flex items-center justify-center",
          className,
        )}
      >
        {checked && (
          <span
            data-slot="checkbox-indicator"
            className="text-current transition-none text-xs"
          >
            ✓
          </span>
        )}
      </div>
    </div>
  );
}

export { Checkbox };
