import React from "react";

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
}

export default function Container({ className = "", children }: ContainerProps) {
  return (
    <div
      className={`w-[92%] lg:w-[82%] max-w-[var(--container-content)] mx-auto px-0 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
