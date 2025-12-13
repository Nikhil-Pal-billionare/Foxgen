"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InputField({ id, label, type, value, onChange }: any) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
      />
    </div>
  );
}
