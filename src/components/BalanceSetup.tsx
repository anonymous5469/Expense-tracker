import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CURRENCIES } from "@/types"
import { useState, useEffect } from "react"
import { Wallet, Save, ArrowRight, Shield, Coins } from "lucide-react"

export function BalanceSetup({ totalBalance, currency, onSave }: { totalBalance: number; currency: string; onSave: (bal:number, cur:string)=>void }) {
  const [bal, setBal] = useState(String(totalBalance))
  const [cur, setCur] = useState(currency)

  useEffect(()=>{ setBal(String(totalBalance)); setCur(currency) }, [totalBalance, currency])

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* left info */}
          <div className="lg:col-span-5 p-5 lg:p-6 flex gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20 shrink-0">
              <Wallet size={20} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">Monthly Budget</p>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400">EDITABLE</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Set your total monthly balance. <span className="text-foreground font-medium">Remaining auto-calculates</span> as <span className="font-mono text-violet-600 dark:text-violet-300">Balance − Spent</span>.</p>
              <div className="mt-3 hidden lg:flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted border"><Shield size={12} /> Local only</span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted border"><Coins size={12} /> Multi-currency</span>
              </div>
            </div>
          </div>

          {/* inputs — fixed alignment */}
          <div className="lg:col-span-7 p-5 lg:p-6 bg-muted/20 border-t lg:border-t-0 lg:border-l flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-[1.7fr_1fr_auto] gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="balance-input" className="text-xs tracking-widest font-semibold text-muted-foreground">TOTAL BALANCE</Label>
                <div className="relative group">
                  <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono group-focus-within:text-violet-500 transition-colors">{CURRENCIES.find(c=>c.value===cur)?.symbol}</span>
                  <Input id="balance-input" type="number" inputMode="decimal" min="0" step="0.01" value={bal} onChange={e=>setBal(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ onSave(Number(bal)||0, cur) }}} placeholder="0" aria-describedby="balance-hint" className="pl-8 h-12 text-lg font-mono font-semibold tabular-nums" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency-select" className="text-xs tracking-widest font-semibold text-muted-foreground">CURRENCY</Label>
                <select id="currency-select" value={cur} onChange={e=>setCur(e.target.value)} className="flex h-12 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring">
                  {CURRENCIES.map(c=> <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={()=>onSave(Number(bal)||0, cur)} className="h-12 px-6 rounded-xl font-semibold shadow-lg shadow-violet-600/20 gap-2 whitespace-nowrap w-full sm:w-auto">
                  <Save size={16} aria-hidden="true" /> Update <ArrowRight size={14} className="opacity-60" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-[11px] text-muted-foreground">
              <p id="balance-hint" className="flex items-center gap-1.5"><span aria-hidden="true" className="h-1 w-1 rounded-full bg-violet-500" /> Press Enter to save • Updates every card instantly</p>
              <span className="hidden sm:inline text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1.5"><span aria-hidden="true" className="h-1 w-1 rounded-full bg-emerald-500" /> Updates instantly across dashboard</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
