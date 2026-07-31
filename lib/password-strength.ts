export interface PasswordCheck {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_CHECKS: PasswordCheck[] = [
  { id: "length", label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { id: "lower", label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { id: "number", label: "One number", test: (pw) => /[0-9]/.test(pw) },
  {
    id: "special",
    label: "One special character",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

export type PasswordStrength = "empty" | "weak" | "medium" | "strong" | "very-strong";

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "empty";
  const passed = PASSWORD_CHECKS.filter((c) => c.test(password)).length;
  if (passed <= 2) return "weak";
  if (passed <= 4) return "medium";
  // All 5 base checks pass — extra length pushes it further
  return password.length >= 12 ? "very-strong" : "strong";
}

export function passesAllChecks(password: string): boolean {
  return PASSWORD_CHECKS.every((c) => c.test(password));
}

export const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  empty: "",
  weak: "Weak",
  medium: "Medium",
  strong: "Strong",
  "very-strong": "Very strong",
};

export const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  empty: "bg-muted",
  weak: "bg-red-500",
  medium: "bg-amber-500",
  strong: "bg-emerald-500",
  "very-strong": "bg-emerald-600",
};

// How many of 4 bar segments to fill for each strength level
export const STRENGTH_SEGMENTS: Record<PasswordStrength, number> = {
  empty: 0,
  weak: 1,
  medium: 2,
  strong: 3,
  "very-strong": 4,
};
