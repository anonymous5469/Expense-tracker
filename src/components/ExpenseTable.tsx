import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CATEGORY_META, CATEGORIES } from "@/types"
import type { Expense, Category } from "@/types"
import { formatCurrency, formatDate, getLocalIsoDate } from "@/lib/utils"
import { Search, Trash2, Pencil, Filter, ArrowUpDown, Download } from "lucide-react"
import { useState, useEffect } from "react"

export function ExpenseTable({ expenses, currency, onDelete, onEdit, searchQuery, onSearchChange }: { expenses: Expense[]; currency: string; onDelete:(id:string)=>void; onEdit:(e:Expense)=>void; searchQuery?: string; onSearchChange?: (v:string)=>void }) {
  const [q, setQ] = useState(searchQuery ?? "")
  const [cat, setCat] = useState<Category | "All">("All")
  // sync with external global search (header)
  useEffect(()=>{ if (searchQuery !== undefined && searchQuery !== q) setQ(searchQuery) }, [q, searchQuery])
  const handleQ = (v:string)=>{ setQ(v); onSearchChange?.(v) }

  const filtered = expenses.filter(e=>{
    const matchQ = !q || e.title.toLowerCase().includes(q.toLowerCase()) || e.category.toLowerCase().includes(q.toLowerCase()) || (e.note && e.note.toLowerCase().includes(q.toLowerCase()))
    const matchCat = cat === "All" || e.category === cat
    return matchQ && matchCat
  })

  const totalFiltered = filtered.reduce((s,e)=>s+e.amount,0)
  const escapeCsvCell = (value: string | number) => {
    const text = String(value)
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text
    return `"${safeText.replace(/"/g, '""')}"`
  }

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardHeader className="pb-4 border-b bg-muted/20">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-muted border flex items-center justify-center" aria-hidden="true">
              <ArrowUpDown size={16} className="text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">Transactions <span className="px-2.5 py-0.5 rounded-full bg-muted border text-xs font-bold text-foreground tabular-nums" aria-label={`${filtered.length} transactions`}>{filtered.length}</span> <span className="hidden sm:inline text-xs font-normal text-muted-foreground tabular-nums">• {formatCurrency(totalFiltered, currency)} filtered</span></CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Full-width • Manage every expense • Click pencil to edit</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-[320px]">
              <label htmlFor="table-search" className="sr-only">Search transactions</label>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="table-search" value={q} onChange={e=>handleQ(e.target.value)} placeholder="Search title, category, notes…" aria-label="Search transactions" className="pl-9 h-10 text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                <select id="category-filter" value={cat} onChange={e=>{
                  const value = e.target.value
                  setCat(value === "All" ? "All" : CATEGORIES.includes(value as Category) ? value as Category : "All")
                }} aria-label="Filter by category" className="h-10 pl-8 pr-9 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-[180px]">
                  <option value="All">All categories</option>
                  {CATEGORIES.map(k=> <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <Button variant="outline" size="sm" aria-label="Export transactions as CSV" onClick={()=>{
                 const csv = ["Title,Category,Date,Amount,Note", ...filtered.map(e=>[e.title, e.category, e.date, e.amount, e.note || ""].map(escapeCsvCell).join(","))].join("\n")
                 const blob = new Blob([csv], {type:"text/csv"})
                 const url = URL.createObjectURL(blob)
                 const a = document.createElement("a"); a.href=url; a.download=`fintrack-${getLocalIsoDate()}.csv`; a.click(); URL.revokeObjectURL(url)
              }} className="h-10 hidden sm:flex gap-1.5"><Download size={14} aria-hidden="true" /> Export</Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Transactions table — use search and filter to narrow results. Columns: Expense, Category, Date, Amount, Actions.</caption>
            <thead className="sticky top-0 z-10">
              <tr className="border-y bg-muted text-xs tracking-widest font-bold text-muted-foreground">
                <th scope="col" className="text-left px-4 lg:px-6 py-3.5">EXPENSE</th>
                <th scope="col" className="text-left px-4 py-3.5 hidden md:table-cell">CATEGORY</th>
                <th scope="col" className="text-left px-4 py-3.5 hidden lg:table-cell">DATE</th>
                <th scope="col" className="text-right px-4 lg:px-6 py-3.5 tabular-nums">AMOUNT</th>
                <th scope="col" className="text-right px-4 lg:px-6 py-3.5">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-2xl bg-muted border flex items-center justify-center text-2xl" aria-hidden="true">📭</div>
                    <p className="text-base font-semibold text-foreground">No transactions found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting search or category filter • Table expands to full screen even when empty.</p>
                    <div className="mt-2 flex flex-wrap gap-2 justify-center">
                      <Button size="sm" onClick={()=>{ handleQ(""); setCat("All") }} variant="secondary" className="h-9">Clear filters</Button>
                      <Button size="sm" onClick={()=>document.dispatchEvent(new CustomEvent('fintrack:openAdd'))} className="h-9 gap-1.5"><span aria-hidden="true">＋</span> Add your first expense</Button>
                    </div>
                  </div>
                </td></tr>
              ) : filtered.map(e=>{
                const meta = CATEGORY_META[e.category]
                return (
                  <tr key={e.id} className="border-b hover:bg-muted/50 transition-colors group" style={{contentVisibility: 'auto', containIntrinsicSize: '0 64px'}}>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className={`h-10 w-10 lg:h-11 lg:w-11 rounded-xl border flex items-center justify-center text-base shrink-0 ${meta.bg}`} aria-hidden="true">{meta.icon}</div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm lg:text-[14px] leading-none truncate max-w-[220px] xl:max-w-[340px]">{e.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="md:hidden inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border bg-muted text-muted-foreground">{e.category}</span>
                            <span className="lg:hidden text-xs text-muted-foreground font-mono tabular-nums">{formatDate(e.date)}</span>
                            {e.note && <span className="hidden xl:inline text-xs text-muted-foreground truncate max-w-[260px]">• {e.note}</span>}
                          </div>
                          {e.note && <p className="xl:hidden text-xs text-muted-foreground truncate max-w-[200px]">{e.note}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color}`}>{e.category}</span></td>
                    <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground font-mono text-sm tabular-nums">{formatDate(e.date)}</td>
                    <td className="px-4 lg:px-6 py-4 text-right font-bold font-mono text-foreground text-sm lg:text-base whitespace-nowrap tabular-nums">{formatCurrency(e.amount, currency)}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex justify-end gap-1.5 opacity-100 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${e.title}`} className="h-9 w-9 rounded-xl" onClick={()=>onEdit(e)} title="Edit"><Pencil size={14} aria-hidden="true" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${e.title}`} className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={()=>onDelete(e.id)} title="Delete"><Trash2 size={14} aria-hidden="true" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {filtered.length>0 && (
              <tfoot>
                <tr className="bg-muted/50 border-t font-semibold">
                  <td colSpan={3} className="px-4 lg:px-6 py-3 text-right text-xs tracking-widest text-muted-foreground hidden md:table-cell">TOTAL FILTERED</td>
                  <td className="px-4 lg:px-6 py-3 text-right font-mono font-bold text-foreground md:hidden" colSpan={2}>{formatCurrency(totalFiltered, currency)} ({filtered.length})</td>
                  <td className="px-4 lg:px-6 py-3 text-right font-mono font-bold text-primary hidden md:table-cell">{formatCurrency(totalFiltered, currency)}</td>
                  <td className="hidden md:table-cell"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {filtered.length>0 && (
          <div className="p-3 lg:p-4 border-t bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Showing {filtered.length} of {expenses.length} • Full-width table</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Live • Auto-saves</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
