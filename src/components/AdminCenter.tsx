import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIAdvisor } from "@/components/AIAdvisor"
import { Shield, Crown, Mail, LogOut, BarChart3, User } from "lucide-react"
import { useExpenseStore } from "@/store/useExpenseStore"

export function AdminCenter({ open, onOpenChange, onOpenSettings }: { open: boolean; onOpenChange: (v:boolean)=>void; onOpenSettings: ()=>void }) {
  const { totalBalance, expenses, currency } = useExpenseStore()
  const totalSpent = expenses.reduce((s,e)=>s+e.amount,0)
  const remaining = totalBalance - totalSpent
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={()=>onOpenChange(false)} className="w-[96vw] max-w-[860px] max-h-[90vh] p-0 gap-0 bg-card border overflow-hidden flex flex-col">
        {/* Header — fixed */}
        <div className="relative shrink-0 border-b bg-card">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-transparent dark:from-violet-600/15 dark:via-indigo-600/10 pointer-events-none" />
          <div className="relative p-5 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-lg font-bold text-white shadow-xl shrink-0">Z</div>
              <div className="flex-1 min-w-0">
                 <div className="flex flex-wrap items-center gap-2">
                   <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Admin • Account Centre</DialogTitle>
                   <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[11px] font-bold tracking-widest">PRO</span>
                 </div>
                 <DialogDescription className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-[52ch]">Manage your account, AI advisor & private settings. Your AI card now lives here — not on the main dashboard.</DialogDescription>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border text-xs text-foreground max-w-full truncate"><Mail size={12} className="shrink-0" /> <span className="truncate">zacky@fintrack.pro</span></span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400"><Shield size={12} /> Verified • Private</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-600 dark:text-violet-300"><Crown size={12} /> Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
          <div className="p-4 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground"><BarChart3 size={12} /> TOTAL BALANCE</div>
                  <p className="text-base sm:text-lg font-mono font-bold text-foreground mt-1 truncate">{currency} {totalBalance.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Monthly budget</p>
                </CardContent>
              </Card>
              <Card className="min-w-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground"><BarChart3 size={12} /> SPENT</div>
                  <p className="text-base sm:text-lg font-mono font-bold text-foreground mt-1 truncate">{currency} {totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{expenses.length} transactions • auto Σ</p>
                </CardContent>
              </Card>
              <Card className={`min-w-0 ${remaining <0 ? "bg-destructive/10 border-destructive/20" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground"><User size={12} /> REMAINING</div>
                  <p className={`text-base sm:text-lg font-mono font-bold mt-1 truncate ${remaining<0 ? "text-destructive":"text-emerald-600 dark:text-emerald-400"}`}>{currency} {remaining.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{remaining<0 ? "Over budget" : "Available"}</p>
                </CardContent>
              </Card>
            </div>

            <div className="w-full min-w-0">
              <AIAdvisor />
            </div>

            <Card>
              <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-muted border flex items-center justify-center shrink-0"><LogOut size={16} className="text-muted-foreground" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Account</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">Zacky • Admin • All data stays in your browser. Manage via Settings.</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                  <Button variant="secondary" size="sm" onClick={()=>{ onOpenChange(false); onOpenSettings() }} className="flex-1 sm:flex-none">Manage Data</Button>
                  <Button variant="ghost" size="sm" onClick={()=>onOpenChange(false)} className="flex-1 sm:flex-none">Close</Button>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-[11px] text-muted-foreground pb-2">Admin Centre • AI card removed from dashboard • Open via avatar (Z) or Admin pill</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
