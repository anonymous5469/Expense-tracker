import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { Wallet, ArrowUpRight, PiggyBank, Flame, TrendingDown, Pencil, Sparkles } from "lucide-react"

interface Props {
  totalBalance: number
  totalSpent: number
  remaining: number
  currency: string
  count: number
  onEditBalance?: () => void
  onEditSpent?: () => void
}

export function StatsCards({ totalBalance, totalSpent, remaining, currency, count, onEditBalance, onEditSpent }: Props) {
  const pct = totalBalance > 0 ? (totalSpent / totalBalance) * 100 : 0
  const remainingPct = 100 - pct
  const isOver = remaining < 0
  const dailyAvg = count > 0 ? totalSpent / 30 : 0
  const isLow = remainingPct < 20 && !isOver
  const isHealthy = remainingPct > 40

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* Balance */}
      <Card className="relative overflow-hidden group/bal hover:shadow-xl transition-all">
        <div className="absolute inset-0 gradient-mesh opacity-20 dark:opacity-30 group-hover/bal:opacity-30 transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl" />
        <CardContent className="p-6 lg:p-7 relative">
          <div className="flex items-start justify-between mb-6">
            <div className="h-12 w-12 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center backdrop-blur">
              <Wallet className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden xl:inline text-[10px] font-bold tracking-[0.16em] text-muted-foreground">TOTAL BALANCE</span>
               <button onClick={onEditBalance} title="Edit total balance" aria-label="Edit total balance" className="h-8 w-8 rounded-xl bg-muted border flex items-center justify-center hover:bg-accent transition-colors shadow-sm">
                <Pencil size={13} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground">MONTHLY BUDGET</p>
            <p className="text-3xl lg:text-[36px] xl:text-[40px] font-bold tracking-tight text-foreground font-mono leading-none">
              {formatCurrency(totalBalance, currency)}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-violet-500" /> {count} transactions • <button onClick={onEditBalance} className="text-violet-600 dark:text-violet-400 hover:text-violet-500 font-medium">Edit balance →</button>
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs">
            <Sparkles size={12} className="text-muted-foreground/60" />
            <span className="text-muted-foreground/60">Expands with screen</span>
          </div>
        </CardContent>
      </Card>

      {/* Spent */}
      <Card className="relative overflow-hidden hover:shadow-xl transition-all group/spent">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.04] via-transparent to-transparent opacity-0 group-hover/spent:opacity-100 transition-opacity" />
        <CardContent className="p-6 lg:p-7 relative">
          <div className="flex items-start justify-between mb-6">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-rose-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold border backdrop-blur ${pct > 80 ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" : pct > 50 ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
                {pct.toFixed(0)}% used
              </span>
               <button onClick={onEditSpent} title="Edit expenses" aria-label="Edit expenses" className="h-8 w-8 rounded-xl bg-muted border flex items-center justify-center hover:bg-accent transition-colors">
                <Pencil size={13} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground">TOTAL SPENT</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted border text-muted-foreground hidden lg:inline">auto Σ</span>
            </div>
            <p className="text-3xl lg:text-[36px] xl:text-[40px] font-bold tracking-tight text-foreground font-mono leading-none">
              {formatCurrency(totalSpent, currency)}
            </p>
            <p className="text-sm text-muted-foreground">Across {count} {count===1?"entry":"entries"} • <span className="text-muted-foreground">Σ of transactions</span></p>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
              <span>Burn rate</span><span className="font-mono">{pct.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(pct,100)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2.5">Σ of all expenses • <button onClick={onEditSpent} className="text-violet-600 dark:text-violet-400 hover:text-violet-500 font-semibold">Manage transactions →</button></p>
          </div>
        </CardContent>
      </Card>

      {/* Remaining */}
      <Card className={`relative overflow-hidden transition-all hover:shadow-xl ${isOver ? "border-destructive/40 bg-destructive/5" : isLow ? "border-amber-500/30" : ""} group/rem`}>
        {isOver && <div className="absolute inset-0 bg-destructive/5" />}
        <CardContent className="p-6 lg:p-7 relative">
          <div className="flex items-start justify-between mb-6">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border backdrop-blur ${isOver ? "bg-destructive/15 border-destructive/25" : isHealthy ? "bg-emerald-500/12 border-emerald-500/15" : "bg-amber-500/12 border-amber-500/15"}`}>
              {isOver ? <TrendingDown className="h-6 w-6 text-destructive" /> : <PiggyBank className={`h-6 w-6 ${isHealthy ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`} />}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 backdrop-blur ${isOver ? "bg-destructive/10 border-destructive/20 text-destructive" : isLow ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
              {!isOver && <span className={`h-2 w-2 rounded-full ${isHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />}
              {isOver ? "OVER BUDGET" : `${remainingPct.toFixed(0)}% left`}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground">REMAINING</p>
            <p className={`text-3xl lg:text-[36px] xl:text-[40px] font-bold tracking-tight font-mono leading-none ${isOver ? "text-destructive" : isLow ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {formatCurrency(remaining, currency)}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame size={14} className={isOver ? "text-destructive" : "text-muted-foreground/60"} />
              <span>~{formatCurrency(dailyAvg, currency)}/day</span>
              {isOver && <span className="text-destructive font-semibold">• Action needed</span>}
              {isHealthy && !isOver && <span className="text-emerald-600 dark:text-emerald-400 hidden xl:inline">• Healthy</span>}
            </div>
          </div>
          <div className="mt-6 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, remainingPct))}%`, background: isOver ? "hsl(var(--destructive))" : isLow ? "#f59e0b" : "#10b981" }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
