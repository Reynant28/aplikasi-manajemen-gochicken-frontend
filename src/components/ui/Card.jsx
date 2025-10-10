import React from "react";
import clsx from "clsx";

/**
 * Komponen Card sederhana
 * - Card: wrapper utama dengan border & shadow
 * - CardContent: isi dalam card
 * - CardHeader, CardTitle, CardDescription opsional (untuk struktur rapi)
 */

export function Card({ className, children }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={clsx("px-4 py-3 border-b border-gray-100", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={clsx("text-lg font-semibold text-gray-800", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children }) {
  return (
    <p className={clsx("text-sm text-gray-500", className)}>{children}</p>
  );
}

export function CardContent({ className, children }) {
  return (
    <div className={clsx("p-4 text-gray-500", className)}>
      {children}
    </div>
  );
}

export default Card;
