import React from "react";
import { Card } from "./Card";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: "cyan" | "lime" | "orange";
  href?: string;
  className?: string;
}

const accentColors = {
  cyan: "text-sky-400",
  lime: "text-emerald-400",
  orange: "text-ds-accent",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  accent = "lime",
  href,
  className = "",
}: MetricCardProps) {
  const content = (
    <>
      {icon && (
        <div className={`mb-1.5 ${accentColors[accent]}`}>{icon}</div>
      )}
      <p className="text-ds-caption font-medium uppercase tracking-wider text-ds-text-muted">
        {title}
      </p>
      <p
        className={`mt-0.5 text-ds-stat font-bold text-ds-text ${icon ? "" : accentColors[accent]}`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-ds-body-sm text-ds-text-muted">{subtitle}</p>
      )}
    </>
  );

  const cardClass = `text-left ${href ? "transition-all duration-250 hover:shadow-ds-md " : ""}${className}`;

  if (href) {
    return (
      <a href={href} className="block">
        <Card className={cardClass}>{content}</Card>
      </a>
    );
  }

  return <Card className={cardClass}>{content}</Card>;
}
