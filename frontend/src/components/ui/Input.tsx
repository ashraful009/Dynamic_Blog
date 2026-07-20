import React from "react";
import { LucideIcon } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  icon: Icon,
  rightElement,
  containerClassName = "",
  className = "",
  id,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className={`mb-5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        )}
        <input
          id={inputId}
          className={`w-full bg-bg-card border rounded-lg py-3 text-text outline-none transition-all focus:ring-1 
            ${Icon ? "pl-10" : "pl-4"} 
            ${rightElement ? "pr-11" : "pr-4"}
            ${error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
              : "border-border focus:border-primary focus:ring-primary"} 
            ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-3 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
