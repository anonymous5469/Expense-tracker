import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CATEGORY_META } from "@/types"
import type { Expense } from "@/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts"
import { formatCurrency, getLocalIsoDate } from "@/lib/utils"

type ChartValue = number | string | ReadonlyArray<number | string> | undefined

export function CategoryChart({ expenses, currency }: { expenses: Expense[]; currency: string }) {
  const byCat = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})
  const data = Object.entries(byCat).map(([name, value]) => ({
    name, value, color: CATEGORY_META[name as keyof typeof CATEGORY_META]?.chart ?? "#888"
  })).sort((a,b)=>b.value-a.value)

  const total = expenses.reduce((s,e)=>s+e.amount,0)

  const days: { date: string; amount: number }[] = []
  for(let i=13;i>=0;i--){
    const d = new Date()
    d.setDate(d.getDate()-i)
     const iso = getLocalIsoDate(d)
    const amt = expenses.filter(e=>e.date===iso).reduce((s,e)=>s+e.amount,0)
    days.push({ date: iso.slice(5), amount: amt })
  }

  if (data.length === 0) {
    return (
      <Card className="h-full min-h-[380px] backdrop-blur">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold tracking-tight">Spending Breakdown</CardTitle><CardDescription className="text-xs">Add expenses to see insights • Full-width fluid</CardDescription></CardHeader>
        <CardContent className="h-[360px] flex flex-col items-center justify-center text-muted-foreground text-sm p-6">
          <div className="h-16 w-16 rounded-2xl bg-muted border flex items-center justify-center text-2xl mb-3">📊</div>
          <p className="font-medium text-foreground">No data yet</p>
          <p className="text-xs text-muted-foreground max-w-sm text-center mt-1">Your charts will appear here across the full width. Add a balance and transactions to see category split and daily trend.</p>
        </CardContent>
      </Card>
    )
  }

  const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 12 } as const

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <Card className="xl:col-span-8 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-bold tracking-tight">Spending Breakdown</CardTitle>
              <CardDescription className="text-xs mt-1">By category • <span className="font-mono font-semibold text-foreground">{formatCurrency(total, currency)}</span> total</CardDescription>
            </div>
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-violet-600/10 border border-violet-500/20 text-xs font-semibold text-violet-600 dark:text-violet-300">{data.length} categories</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-6 items-start">
            <div className="space-y-4">
              <div className="h-[240px] lg:h-[280px] xl:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={72} outerRadius={112} dataKey="value" paddingAngle={3} cornerRadius={6}>
                      {data.map((e,i)=><Cell key={i} fill={e.color} stroke="hsl(var(--background))" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: ChartValue)=>[formatCurrency(Number(value ?? 0), currency), "Spent"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-muted border text-center">
                  <p className="text-[10px] tracking-widest font-bold text-muted-foreground">TOP CAT</p>
                  <p className="text-xs font-bold text-foreground truncate mt-1">{data[0]?.name}</p>
                  <p className="text-xs font-mono text-violet-600 dark:text-violet-300">{data[0] ? ((data[0].value/total)*100).toFixed(0):0}%</p>
                </div>
                <div className="p-3 rounded-xl bg-muted border text-center">
                  <p className="text-[10px] tracking-widest font-bold text-muted-foreground">CATEGORIES</p>
                  <p className="text-lg font-bold font-mono text-foreground">{data.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted border text-center">
                  <p className="text-[10px] tracking-widest font-bold text-muted-foreground">AVG</p>
                  <p className="text-xs font-bold font-mono text-foreground">{formatCurrency(total/Math.max(1,data.length), currency)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 min-w-0">
              <div className="space-y-2">
                {data.slice(0,6).map(d=>{
                  const pct = total ? (d.value/total)*100 : 0
                  return (
                    <div key={d.name} className="group flex items-center gap-3 p-3 rounded-xl bg-muted/50 border hover:bg-muted transition-colors">
                      <span className="h-3 w-3 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-background" style={{ background:d.color }} />
                      <span className="text-sm font-medium text-foreground flex-1 truncate">{d.name}</span>
                      <span className="text-sm font-mono font-bold text-foreground">{formatCurrency(d.value, currency)}</span>
                      <span className="text-xs font-mono px-2 py-1 rounded-full bg-background border text-muted-foreground w-12 text-center">{pct.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
              <div className="h-[160px] lg:h-[180px] rounded-xl bg-muted border p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.slice(0,6)} layout="vertical" margin={{ left: 10, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: ChartValue)=>formatCurrency(Number(value ?? 0),currency)} />
                    <Bar dataKey="value" radius={[0,10,10,0]} barSize={14}>
                      {data.slice(0,6).map((e,i)=><Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-4 overflow-hidden shadow-xl flex flex-col">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-sm font-bold tracking-tight">Daily Trend</CardTitle>
          <CardDescription className="text-xs">Last 14 days • Fluid width</CardDescription>
        </CardHeader>
        <CardContent className="p-4 lg:p-5 flex-1 flex flex-col">
          <div className="h-[260px] lg:h-[300px] xl:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={days}>
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:11, fill:"hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={2} />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color:"hsl(var(--muted-foreground))", fontWeight:600 }} formatter={(value: ChartValue)=>[formatCurrency(Number(value ?? 0),currency),"Spent"]} />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#g2)" dot={false} activeDot={{ r:5, fill:"#8b5cf6", stroke:"hsl(var(--background))", strokeWidth:2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 lg:p-4 rounded-xl bg-muted border"><p className="text-[10px] tracking-widest font-bold text-muted-foreground">PEAK DAY</p><p className="text-sm lg:text-base font-bold font-mono text-foreground mt-1">{formatCurrency(Math.max(...days.map(d=>d.amount)), currency)}</p><p className="text-xs text-muted-foreground">{days.find(d=>d.amount===Math.max(...days.map(x=>x.amount)))?.date || "-"}</p></div>
            <div className="p-3 lg:p-4 rounded-xl bg-muted border"><p className="text-[10px] tracking-widest font-bold text-muted-foreground">AVG / DAY</p><p className="text-sm lg:text-base font-bold font-mono text-foreground mt-1">{formatCurrency(days.reduce((s,d)=>s+d.amount,0)/14, currency)}</p><p className="text-xs text-muted-foreground">14-day mean</p></div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 text-center">Fully responsive • Light & dark</p>
        </CardContent>
      </Card>
    </div>
  )
}
