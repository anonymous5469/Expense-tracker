import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES, CATEGORY_META } from "@/types"
import type { Category } from "@/types"
import { Plus } from "lucide-react"
import { getLocalIsoDate } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (v:boolean)=>void
  onSubmit: (data:{ title:string; amount:number; category:Category; date:string; note?:string })=>void
  initial?: { title:string; amount:number; category:Category; date:string; note?:string } | null
}

export function ExpenseForm({ open, onOpenChange, onSubmit, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "")
  const [category, setCategory] = useState<Category>(initial?.category ?? "Food & Dining")
  const [date, setDate] = useState(initial?.date ?? getLocalIsoDate())
  const [note, setNote] = useState(initial?.note ?? "")
  const [errors, setErrors] = useState<{title?:string; amount?:string; date?:string}>({})

  const titleRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    if (open) {
      setTitle(initial?.title ?? "")
      setAmount(initial ? String(initial.amount) : "")
      setCategory(initial?.category ?? "Food & Dining")
       setDate(initial?.date ?? getLocalIsoDate())
      setNote(initial?.note ?? "")
      setErrors({})
      // focus after dialog animation
      setTimeout(()=> titleRef.current?.focus(), 100)
    }
  }, [open, initial])

  const validate = () => {
    const e: typeof errors = {}
    if (!title.trim()) e.title = "Title is required"
    else if (title.trim().length < 2) e.title = "At least 2 characters"
    const num = Number(amount)
    if (!amount || isNaN(num)) e.amount = "Amount is required"
    else if (num <= 0) e.amount = "Must be greater than 0"
    else if (num > 1000000) e.amount = "Amount too large"
    if (!date) e.date = "Date is required"
    else {
       const d = new Date(`${date}T00:00:00`)
      const today = new Date()
      today.setHours(23,59,59,999)
      if (d > today) e.date = "Date cannot be in the future"
    }
    setErrors(e)
    return e
  }

  const handle = (e?: React.FormEvent) => {
    e?.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      // focus first error
      if (errs.title) titleRef.current?.focus()
      else if (errs.amount) amountRef.current?.focus()
      return
    }
    onSubmit({ title: title.trim(), amount: Number(amount), category, date, note: note.trim() || undefined })
    setTitle(""); setAmount(""); setNote("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={()=>onOpenChange(false)} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><span className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center" aria-hidden="true"><Plus size={16} className="text-white" /></span>{initial ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <DialogDescription>Track where your money goes. Remaining will recalc automatically.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handle} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="expense-title">What did you spend on? <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input ref={titleRef} id="expense-title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Lunch at Cafe, Uber ride" required aria-required="true" aria-invalid={!!errors.title} aria-describedby={errors.title ? "title-error" : undefined} autoComplete="off" spellCheck={false} />
            {errors.title && <p id="title-error" role="alert" className="text-xs text-destructive">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="expense-amount">Amount <span aria-hidden="true" className="text-destructive">*</span></Label>
              <Input ref={amountRef} id="expense-amount" type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0" className="font-mono tabular-nums" required aria-required="true" aria-invalid={!!errors.amount} aria-describedby={errors.amount ? "amount-error" : undefined} />
              {errors.amount && <p id="amount-error" role="alert" className="text-xs text-destructive">{errors.amount}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expense-date">Date <span aria-hidden="true" className="text-destructive">*</span></Label>
             <Input id="expense-date" type="date" value={date} onChange={e=>setDate(e.target.value)} max={getLocalIsoDate()} required aria-required="true" aria-invalid={!!errors.date} aria-describedby={errors.date ? "date-error" : undefined} />
              {errors.date && <p id="date-error" role="alert" className="text-xs text-destructive">{errors.date}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label id="category-label">Category</Label>
            <div role="group" aria-labelledby="category-label" className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(c=>{
                const meta = CATEGORY_META[c]
                const active = c===category
                return (
                  <button key={c} type="button" aria-pressed={active} aria-label={`Category ${c}`} onClick={()=>setCategory(c)} className={`p-2.5 rounded-xl border text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${active ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/20" : "bg-muted border hover:bg-accent text-muted-foreground hover:text-foreground"}`}>
                    <div className="text-sm leading-none flex items-center gap-1.5"><span aria-hidden="true">{meta.icon}</span><span className="text-[11px] font-semibold truncate">{c}</span></div>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expense-note">Note (optional)</Label>
            <Textarea id="expense-note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note..." rows={2} maxLength={200} aria-describedby="note-hint" />
            <p id="note-hint" className="text-xs text-muted-foreground">{note.length}/200</p>
          </div>
          <Button type="submit" className="w-full h-11 text-sm font-semibold">Save Expense • Auto-update Remaining</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
