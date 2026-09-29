"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterDropdownProps = { label: string; value: string; options: string[]; onChange: (value: string) => void; className?: string };

export function FilterDropdown({ label, value, options, onChange, className }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!containerRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, []);
  return <div className={cn("filter-dropdown", open && "is-open", className)} ref={containerRef}><button className="filter-dropdown-trigger" type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}><span>{label}</span><strong>{value}</strong><ChevronDown size={15} /></button>{open && <div className="filter-dropdown-menu" role="listbox" aria-label={label}>{options.map((option) => <button className={cn("filter-dropdown-option", option === value && "is-selected")} key={option} type="button" role="option" aria-selected={option === value} onClick={() => { onChange(option); setOpen(false); }}>{option === value ? <Check size={15} /> : <span className="filter-option-spacer" />}{option}</button>)}</div>}</div>;
}
