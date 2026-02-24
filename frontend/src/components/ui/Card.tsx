import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddings = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const Card = ({ children, className = "", padding = "md" }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
