# EcoFurnish Architecture

## Principles

### 1. Single Responsibility Principle (SRP)

Every component should have one clear responsibility.

Examples:

- Logo → Displays the brand
- NavLinks → Renders navigation links
- CartButton → Opens the shopping cart
- UserMenu → Shows authenticated user actions

---

### 2. Single Source of Truth

Data should live in one place.

Examples:

- site.ts → Branding
- navigation.ts → Navigation items

Components should consume data rather than hardcoding it.

---

### 3. Composition

Large UI pieces are built from small reusable components.

Example:

Navbar

├── Logo

├── NavLinks

├── SearchButton

├── WishlistButton

├── CartButton

└── UserMenu

---

### 4. Reusability

Every component should be reusable whenever possible.

Avoid copying UI.

---

### 5. Accessibility

Accessibility is part of the implementation, not an afterthought.

Use semantic HTML, keyboard navigation, and ARIA labels where appropriate.