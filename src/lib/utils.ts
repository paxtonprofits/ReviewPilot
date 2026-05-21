import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function starEmoji(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export function ratingColor(rating: number): string {
  if (rating >= 4) return "text-emerald-600";
  if (rating === 3) return "text-amber-500";
  return "text-red-500";
}
