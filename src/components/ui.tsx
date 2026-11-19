import type { ReactNode } from 'react'
import { cn } from '~/lib/cn'

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-[#e0e6ed] rounded-[10px] p-4 my-3.5">
      <h2 className="text-lg mb-3 font-semibold">{title}</h2>
      {children}
    </div>
  )
}

export function Metric({
  label,
  value,
  note,
}: {
  label: string
  value: ReactNode
  note?: string
}) {
  return (
    <div className="bg-white border border-[#e0e6ed] rounded-[10px] p-4">
      <small className="text-[#64778a]">{label}</small>
      <div className="text-[29px] font-semibold tracking-tight my-2">{value}</div>
      {note ? <small className="text-[#64778a]">{note}</small> : null}
    </div>
  )
}

export function Tag({
  children,
  variant = 'ok',
}: {
  children: ReactNode
  variant?: 'ok' | 'warn' | 'bad'
}) {
  const styles = {
    ok: 'bg-[#e8f2f2] text-[#16706d]',
    warn: 'bg-[#fff2dc] text-[#a96515]',
    bad: 'bg-[#fbe8e8] text-[#ae3c3c]',
  }
  return (
    <span className={cn('inline-block rounded px-1.5 py-1 text-[11px]', styles[variant])}>
      {children}
    </span>
  )
}

export function Btn({
  children,
  onClick,
  primary,
  disabled,
  type = 'button',
  className,
}: {
  children: ReactNode
  onClick?: () => void
  primary?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'cursor-pointer border border-[#d5dfe8] bg-white text-[#203a50] px-3 py-2 rounded-md text-sm disabled:opacity-45',
        className,
        primary && 'bg-[#087f80] border-[#087f80] text-white hover:bg-[#07696a]',
        !primary && 'hover:bg-[#e8f4f2]',
      )}
    >
      {children}
    </button>
  )
}

export function Banner({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#e5f3ef] text-[#206459] border border-[#cbe4dc] px-3.5 py-2.5 rounded-md text-xs mb-3">
      {children}
    </div>
  )
}