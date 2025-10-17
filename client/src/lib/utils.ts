import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "UZS", locale: string = "uz-UZ") {
  if (currency === "UZS") {
    // Format for Uzbek Sum (so'm)
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  // Default to USD for other currencies
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getImagePlaceholder(width: number = 400, height: number = 300): string {
  return `https://placehold.co/${width}x${height}/16a34a/FFFFFF?text=FreshCart`;
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getDir(lang: string): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}

export function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9);
}
