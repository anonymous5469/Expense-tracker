import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/Header"
import { BalanceSetup } from "@/components/BalanceSetup"
import { StatsCards } from "@/components/StatsCards"
import { CategoryChart } from "@/components/CategoryChart"
import { ExpenseTable } from "@/components/ExpenseTable"
import { ExpenseForm } from "@/components/ExpenseForm"
import { AdminCenter } from "@/components/AdminCenter"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useExpenseStore } from "@/store/useExpenseStore"
import type { Expense } from "@/types"
import { Plus, Trash2, Sparkles, Info, TrendingUp, Wallet, Clock } from "lucide-react"

const OPEN_ADD_EVENT = "fintrack:openAdd"
type Theme = "light" | "dark"

function getGreeting(d: Date) {
  const h = d.getHours()
  if (h >= 5 && h < 12) return { text: "Good morning", emoji: "🌅", sub: "Hope your morning is productive" }
  if (h >= 12 && h < 17) return { text: "Good afternoon", emoji: "☀️", sub: "Keep the momentum going" }
  if (h >= 17 && h < 21) return { text: "Good evening", emoji: "🌆", sub: "Wind down & review your spend" }
  return { text: "Good night", emoji: "🌙", sub: "Plan for a smarter tomorrow" }
}

function App() {
  const { totalBalance, currency, expenses, setTotalBalance, setCurrency, addExpense, updateExpense, deleteExpense, clearAll, geminiKey } = useExpenseStore()
  const [openAdd, setOpenAdd] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [toast, setToast] = useState<{msg:string; action?:{label:string; onClick:()=>void}} | null>(null)
  const [now, setNow] = useState<Date>(()=> new Date())
  const greeting = useMemo(()=> getGreeting(now), [now])
  const [globalSearch, setGlobalSearch] = useState(()=> new URLSearchParams(window.location.search).get("q") || "")
  const [theme, setTheme] = useState<Theme>(()=> {
    const saved = localStorage.getItem('fintrack-theme')
    if (saved === "light" || saved === "dark") return saved
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
    return 'dark'
  })

  const totalSpent = useMemo(()=> expenses.reduce((s,e)=>s+e.amount,0), [expenses])
  const remaining = totalBalance - totalSpent
  const runwayDays = useMemo(() => {
    if (totalBalance <= 0 || totalSpent <= 0 || remaining < 0) return null
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const elapsedDays = Math.max(1, Math.ceil((now.getTime() - monthStart.getTime()) / 86_400_000))
    return Math.max(0, Math.floor(remaining / (totalSpent / elapsedDays)))
  }, [remaining, totalBalance, totalSpent])

  // real-time clock — updates every 30s for greeting + time
  useEffect(()=>{
    const id = setInterval(()=> setNow(new Date()), 30_000)
    return ()=> clearInterval(id)
  }, [])

  // Theme — light/dark with persistence.
  useEffect(()=>{
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('fintrack-theme', theme)
  }, [theme])

  useEffect(()=>{
    if (localStorage.getItem("expense-tracker-v2")) {
      localStorage.removeItem("expense-tracker-v2")
    }
    if (expenses.length === 5 && expenses.some(e => ["1","2","3","4","5"].includes(e.id))) {
      clearAll()
    }
  }, [clearAll, expenses])

  // URL sync for search + listen for empty-state CTA
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search)
    if (globalSearch) params.set("q", globalSearch)
    else params.delete("q")
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`
    window.history.replaceState(null, "", newUrl)
  }, [globalSearch])
  useEffect(()=>{
    const handler = () => setOpenAdd(true)
    document.addEventListener(OPEN_ADD_EVENT, handler)
    return ()=> document.removeEventListener(OPEN_ADD_EVENT, handler)
  }, [])
  // Cmd+K focus header search
  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        document.getElementById("header-search")?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return ()=> window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(()=>{
    if (toast) {
      const t = setTimeout(()=>setToast(null), 3500)
      return ()=>clearTimeout(t)
    }
  }, [toast])

  const handleSaveBalance = (bal:number, cur:string) => {
    setTotalBalance(bal)
    setCurrency(cur)
    setToast({msg:`Budget updated to ${cur} ${bal.toLocaleString()}`})
  }

  const handleAdd = (data: Omit<Expense, "id">) => {
    addExpense(data)
    setToast({msg:"Expense added • Remaining auto-updated"})
  }
  const handleUpdate = (data: Omit<Expense, "id">) => {
    if (!editing) return
    updateExpense(editing.id, data)
    setEditing(null)
    setToast({msg:"Expense updated"})
  }

  const handleDeleteWithUndo = (id:string) => {
    const victim = expenses.find(e=>e.id===id)
    if (!victim) return
    deleteExpense(id)
    setToast({msg:`Deleted "${victim.title}"`, action:{label:"Undo", onClick:()=>{
      // restore at top — addExpense generates new id, so we restore via store directly
      const { expenses: cur } = useExpenseStore.getState()
      if (!cur.find(e=>e.id===id)) {
        useExpenseStore.setState({ expenses: [victim, ...cur] })
        setToast({msg:"Restored"})
      }
    }}})
  }

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${theme==='dark' ? 'bg-[#09090b] text-zinc-100 selection:bg-violet-600 selection:text-white' : 'bg-[#f8fafc] text-zinc-900 selection:bg-violet-600 selection:text-white'}`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-[100] px-4 py-2 bg-primary text-primary-foreground rounded-md shadow">Skip to content</a>
      {/* full bleed background — adaptive */}
      <div className="fixed inset-0 -z-10 w-full">
        <div className={`absolute inset-0 ${theme==='dark' ? 'bg-[#09090b]' : 'bg-[#f8fafc]'}`} />
        <div className={`absolute inset-0 ${theme==='dark' ? 'bg-[linear-gradient(to_right,#27272a0a_1px,transparent_1px),linear-gradient(to_bottom,#27272a0a_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#e4e4e733_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e733_1px,transparent_1px)]'} bg-[size:32px_32px]`} />
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1600px] h-[700px] rounded-full blur-3xl ${theme==='dark' ? 'bg-gradient-to-br from-violet-600/12 via-indigo-600/10 to-transparent' : 'bg-gradient-to-br from-violet-600/[0.07] via-indigo-600/[0.06] to-transparent'}`} />
        <div className={`absolute top-32 right-0 w-[900px] h-[700px] rounded-full blur-3xl ${theme==='dark' ? 'bg-sky-600/[0.06]' : 'bg-sky-600/[0.04]'}`} />
        <div className={`absolute bottom-0 left-0 w-[800px] h-[500px] rounded-full blur-3xl ${theme==='dark' ? 'bg-fuchsia-600/[0.04]' : 'bg-fuchsia-600/[0.03]'}`} />
      </div>

      <Header theme={theme} onToggle={()=>setTheme(theme==='dark'?'light':'dark')} onSettings={()=>setShowSettings(true)} onAdmin={()=>setShowAdmin(true)} searchValue={globalSearch} onSearchChange={setGlobalSearch} />

      {/* FULL WIDTH MAIN — no max-w, uses entire screen */}
      <main id="main-content" tabIndex={-1} className="w-full px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 lg:py-8 space-y-6 lg:space-y-8 safe-px">
        {/* Intro — full width hero with REAL-TIME greeting */}
        <div className="w-full flex flex-col xl:flex-row xl:items-end justify-between gap-4 lg:gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-bold tracking-widest">DASHBOARD</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border text-xs font-medium text-foreground">
                <Clock size={12} className="text-violet-500" /> <span className="font-mono">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> <span className="text-muted-foreground hidden sm:inline">• {now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}</span> <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>
            <h2 className="text-[28px] md:text-[34px] lg:text-[40px] xl:text-[44px] font-bold tracking-tight text-foreground leading-[0.9] flex flex-wrap items-baseline gap-3">
              {greeting.text}, Zacky <span className="inline-block text-[28px] lg:text-[36px]">{greeting.emoji}</span>
              <span className="text-sm lg:text-base font-medium text-muted-foreground tracking-normal hidden sm:inline">— {greeting.sub}</span>
            </h2>
            <p className="text-sm lg:text-base text-muted-foreground mt-3 max-w-3xl leading-relaxed">Track your monthly balance, spent & remaining in real-time across the full width of your display. Get AI-powered cuts to save more — premium, private, offline-first.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 xl:shrink-0">
            <div className="hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-xs font-bold tracking-widest text-muted-foreground">RUNWAY</p>
                 <p className="text-sm font-mono font-bold text-foreground">{runwayDays === null ? "—" : `${runwayDays} days`}</p>
              </div>
              <div className="h-8 w-px bg-border mx-1" />
              <div>
                <p className="text-xs font-bold tracking-widest text-muted-foreground">BALANCE</p>
                <p className="text-sm font-mono font-bold text-foreground">{currency} {totalBalance.toLocaleString()}</p>
              </div>
            </div>
            <Button onClick={()=>setOpenAdd(true)} className="h-12 px-7 rounded-xl font-bold shadow-lg shadow-violet-600/20 gap-2 text-sm whitespace-nowrap">
              <Plus size={18} /> Add Expense
            </Button>
          </div>
        </div>

        {/* Balance — full bleed */}
        <div id="balance-setup" className="w-full">
          <BalanceSetup totalBalance={totalBalance} currency={currency} onSave={handleSaveBalance} />
        </div>

        {/* Stats — 3-up fluid */}
        <StatsCards
          totalBalance={totalBalance}
          totalSpent={totalSpent}
          remaining={remaining}
          currency={currency}
          count={expenses.length}
          onEditBalance={() => {
            document.getElementById("balance-setup")?.scrollIntoView({ behavior: "smooth", block: "center" })
            setTimeout(() => {
              const el = document.querySelector('#balance-setup input') as HTMLInputElement | null
              el?.focus(); el?.select()
              const card = document.getElementById("balance-setup")
              if (card) {
                card.classList.add("ring-2", "ring-violet-600", "ring-offset-2", "ring-offset-background")
                setTimeout(()=> card.classList.remove("ring-2", "ring-violet-600", "ring-offset-2", "ring-offset-background"), 1400)
              }
            }, 400)
          }}
          onEditSpent={() => {
            const el = document.getElementById("transactions")
            if (expenses.length === 0) {
              setOpenAdd(true)
              setToast({msg:"Add your first expense — Total Spent auto-updates"})
            } else {
              el?.scrollIntoView({ behavior: "smooth", block: "start" })
              setToast({msg:"Edit / delete any transaction below — Total Spent recalculates instantly"})
              if (el) {
                el.classList.add("ring-2", "ring-violet-600", "ring-offset-2", "ring-offset-background", "rounded-2xl")
                setTimeout(()=> el.classList.remove("ring-2", "ring-violet-600", "ring-offset-2", "ring-offset-background", "rounded-2xl"), 1400)
              }
            }
          }}
        />

        {/* Charts — now full width (AI moved to Admin Centre) */}
        <div className="w-full">
          <CategoryChart expenses={expenses} currency={currency} />
        </div>

        {/* Transactions — full width */}
        <div id="transactions" className="w-full">
          <ExpenseTable
            expenses={expenses}
            currency={currency}
            searchQuery={globalSearch}
            onSearchChange={setGlobalSearch}
            onDelete={(id)=> handleDeleteWithUndo(id)}
            onEdit={(e)=>{
              setEditing(e)
            }}
          />
        </div>

        {/* Footer info — full bleed */}
        <Card className="w-full bg-card/50 backdrop-blur">
          <CardContent className="p-5 lg:p-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex gap-3 lg:gap-4">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 dark:bg-violet-600/15 flex items-center justify-center shrink-0"><Info size={18} className="text-violet-600 dark:text-violet-400" /></div>
              <div>
                <p className="text-sm font-bold text-foreground">How remaining is calculated — fluid, real-time</p>
                <p className="text-xs lg:text-sm text-muted-foreground mt-1">Remaining = <span className="font-mono font-semibold text-foreground">{currency} {totalBalance.toLocaleString()}</span> − <span className="font-mono font-semibold text-foreground">{currency} {totalSpent.toLocaleString()}</span> = <span className={`font-mono font-bold ${remaining<0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>{currency} {remaining.toLocaleString()}</span> • Updates instantly as you edit. Layout uses 100% of your screen.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
              <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border"><Wallet size={12} /> {expenses.length} txns</span>
              <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-violet-500" /> Gemini AI • No server</span>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground py-2">Built with ♥ • Premium Expense OS • Full-width fluid • Data lives in your browser • {new Date().getFullYear()}</p>
      </main>

      <ExpenseForm open={openAdd} onOpenChange={setOpenAdd} onSubmit={handleAdd} key="add" />

      {editing && (
        <ExpenseForm
          open={!!editing}
          onOpenChange={(v)=> !v && setEditing(null)}
          initial={editing}
          onSubmit={handleUpdate}
          key={editing.id}
        />
      )}

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent onClose={()=>setShowSettings(false)} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Manage your tracker & privacy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-muted border">
              <p className="text-sm font-medium text-foreground">Storage</p>
              <p className="text-xs text-muted-foreground mt-1">All data is stored in <span className="font-mono text-foreground">localStorage</span> under <span className="font-mono text-foreground">expense-tracker-v3</span> (previous v2 sample data has been removed). Clearing will reset balance & expenses. Gemini key is stored separately.</p>
              <div className="mt-3 flex gap-2">
                <Button variant="destructive" size="sm" onClick={()=>{ if(confirm("Clear all expenses & reset balance?")) { clearAll(); setShowSettings(false); setToast({msg:"All data cleared"}) } }} className="gap-1.5"><Trash2 size={14} /> Clear All Data</Button>
                <Button variant="secondary" size="sm" onClick={()=>{ localStorage.removeItem("expense-tracker-v3"); localStorage.removeItem("expense-tracker-v2"); location.reload() }}>Reset App</Button>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-violet-500/5 dark:bg-violet-950/30 border border-violet-500/20 dark:border-violet-900/40">
              <p className="text-sm font-medium text-violet-700 dark:text-violet-200 flex items-center gap-1.5"><Sparkles size={14} /> Gemini API</p>
              <p className="text-xs text-violet-700/70 dark:text-violet-300/70 mt-1">Status: <span className={geminiKey ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-amber-600 dark:text-amber-400 font-medium"}>{geminiKey ? "Key saved ✓" : "No key — add in Admin"}</span> • Now in <button onClick={()=>{ setShowSettings(false); setShowAdmin(true) }} className="underline text-violet-600 dark:text-violet-300">Admin →</button></p>
              <p className="text-xs text-muted-foreground mt-2">Keys never leave your device except to call Gemini directly from your browser.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={()=>setShowSettings(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AdminCenter open={showAdmin} onOpenChange={setShowAdmin} onOpenSettings={()=>{ setShowAdmin(false); setTimeout(()=>setShowSettings(true),150) }} />

      {toast && (
        <div role="status" aria-live="polite" aria-atomic="true" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl bg-card border shadow-2xl flex items-center gap-2 text-sm font-medium text-foreground animate-in slide-in-from-bottom-2 bottom-24 md:bottom-6">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" /> {toast.msg}
          {toast.action && <button onClick={()=>{ toast.action!.onClick(); setToast(null)}} className="ml-2 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90">{toast.action.label}</button>}
        </div>
      )}

      <button onClick={()=>setOpenAdd(true)} aria-label="Add expense" className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-2xl bg-violet-600 text-white shadow-xl shadow-violet-600/30 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Plus size={24} />
      </button>
    </div>
  )
}

export default App
