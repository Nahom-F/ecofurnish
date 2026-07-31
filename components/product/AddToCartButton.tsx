import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function AddToCartButton({ onClick, disabled }: AddToCartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-medium text-white transition-all hover:bg-emerald-800 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShoppingCart size={18} />
      {disabled ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}
