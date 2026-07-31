"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  max,
}: QuantitySelectorProps) {
  return (
    <div className="flex w-fit items-center rounded-xl border">
      <button type="button" onClick={onDecrease} className="p-3" aria-label="Decrease quantity">
        <Minus size={18} />
      </button>
      <span className="w-12 text-center">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        className="p-3"
        aria-label="Increase quantity"
        disabled={max !== undefined && quantity >= max}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
