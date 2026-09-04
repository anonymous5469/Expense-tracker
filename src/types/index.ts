export type Category = "Food & Dining" | "Transport" | "Shopping" | "Bills & Utilities" | "Health" | "Entertainment" | "Groceries" | "Rent" | "Other"

export interface Expense {
  id: string
  title: string
  amount: number
  category: Category
  date: string // ISO date
  note?: string
}

export const CATEGORIES: Category[] = ["Food & Dining", "Groceries", "Transport", "Shopping", "Bills & Utilities", "Rent", "Health", "Entertainment", "Other"]

export const CATEGORY_META: Record<Category, { color: string; bg: string; icon: string; chart: string }> = {
  "Food & Dining": { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: "🍔", chart: "#f97316" },
  "Groceries": { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "🛒", chart: "#10b981" },
  "Transport": { color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20", icon: "🚕", chart: "#0ea5e9" },
  "Shopping": { color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", icon: "🛍️", chart: "#ec4899" },
  "Bills & Utilities": { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: "💡", chart: "#f59e0b" },
  "Rent": { color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: "🏠", chart: "#8b5cf6" },
  "Health": { color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: "🏥", chart: "#f43f5e" },
  "Entertainment": { color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", icon: "🎬", chart: "#06b6d4" },
  "Other": { color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20", icon: "📦", chart: "#a1a1aa" },
}

export const CURRENCIES = [
  { value: "INR", label: "INR (₹)", symbol: "₹" },
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
] as const
