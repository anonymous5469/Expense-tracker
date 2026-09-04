import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "INR") {
  const locale = currency === "INR" ? "en-IN" : currency === "EUR" ? "de-DE" : "en-US"
  const symbolMap: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" }
  // use Intl but fallback to symbol
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${symbolMap[currency] ?? "₹"}${amount.toLocaleString(locale)}`
  }
}

export function formatDate(dateStr: string) {
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr)
    if (Number.isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  } catch { return dateStr }
}

export function getLocalIsoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message
  return fallback
}
