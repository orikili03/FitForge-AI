import React from "react";
import { Link } from "react-router-dom";

export type StatCardGradient = "red" | "orange" | "blue" | "pink";

const gradientMap: Record<StatCardGradient, string> = {
  red: "bg-ds-stat-red",
  orange: "bg-ds-stat-orange",
  blue: "bg-ds-stat-blue",
  pink: "bg-ds-stat-pink",
};

export interface StatCardProps {
  label: string;
  value: string | number;
  gradient: StatCardGradient;
  icon?: React.ReactNode;
  href?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  gradient,
  icon,
  href,
  className = "",
}: StatCardProps) {
  const content = (
    <div
      className={`
        flex min-h-[7rem] flex-col justify-between rounded-ds-xl p-ds-3
        ${gradientMap[gradient]} shadow-ds-sm
        transition-all duration-250 hover:shadow-ds-md
        ${href ? "cursor-pointer" : ""} ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <span className="text-ds-caption font-medium uppercase tracking-wider text-ds-text-muted">
          {label}
        </span>
        {icon && (
          <div className="text-ds-text-muted opacity-70 transition-opacity duration-250 group-hover:opacity-100">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-ds-2 text-ds-stat font-bold tracking-tight text-ds-text">
        {value}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block group">
        {content}
      </Link>
    );
  }

  return content;
}
