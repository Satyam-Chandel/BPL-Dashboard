"use client";

import { useTheme } from "../../contexts/ThemeContext";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "light" } = useTheme();

  return (
    <Sonner
      theme={theme === "custom" ? "light" : theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(var(--popover))",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "hsl(var(--background))",
          "--success-text": "hsl(var(--foreground))",
          "--success-border": "hsl(var(--border))",
          "--error-bg": "hsl(var(--destructive))",
          "--error-text": "hsl(var(--destructive-foreground))",
          "--error-border": "hsl(var(--destructive))",
        } as React.CSSProperties
      }
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  );
};

export { Toaster };