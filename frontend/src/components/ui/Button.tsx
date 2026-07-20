import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText = "Loading...",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = "flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white border border-transparent",
    secondary: "bg-bg-elevated hover:bg-bg-tertiary text-text border border-border",
    outline: "bg-transparent hover:bg-bg-elevated text-primary border border-primary",
    ghost: "bg-transparent hover:bg-white/5 text-text-secondary hover:text-text border border-transparent",
  };

  const sizes = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-[15px]",
    lg: "py-4 px-8 text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="spinner" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
