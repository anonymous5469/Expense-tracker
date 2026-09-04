import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Expense } from "@/types"

interface ExpenseState {
  totalBalance: number
  currency: string
  expenses: Expense[]
  geminiKey: string
  selectedModel: string
  setTotalBalance: (v: number) => void
  setCurrency: (c: string) => void
  setGeminiKey: (k: string) => void
  setSelectedModel: (m: string) => void
  addExpense: (e: Omit<Expense, "id">) => void
  updateExpense: (id: string, patch: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  clearAll: () => void
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      totalBalance: 0,
      currency: "INR",
      expenses: [],
      geminiKey: "",
      selectedModel: "auto",
      setTotalBalance: (v) => set({ totalBalance: v }),
      setCurrency: (c) => set({ currency: c }),
      setGeminiKey: (k) => set({ geminiKey: k }),
      setSelectedModel: (m) => set({ selectedModel: m }),
      addExpense: (e) => set((s) => ({ expenses: [{ ...e, id: Math.random().toString(36).slice(2,9) }, ...s.expenses] })),
      updateExpense: (id, patch) => set((s) => ({ expenses: s.expenses.map(x => x.id === id ? { ...x, ...patch } : x) })),
      deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter(x => x.id !== id) })),
      clearAll: () => set({ expenses: [], totalBalance: 0 }),
    }),
    { name: "expense-tracker-v3" }
  )
)
