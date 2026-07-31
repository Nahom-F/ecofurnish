export const siteConfig = {
  name: "EcoFurnish",

  brand: {
    first: "Eco",
    second: "Furnish",
  },

  description:
    "Premium sustainable furniture crafted from recycled materials.",

  tagline: "Furniture built to last generations.",

  // Must match wherever the site is actually deployed — this is what
  // metadataBase resolves the manifest link, icons, and OG/Twitter image
  // URLs against. Currently the real deployment target per DEPLOY.md.
  // Update this (and NEXT_PUBLIC_APP_URL / BETTER_AUTH_URL) together if
  // you move to a different domain later.
  url: "https://ecofurnish.de5.net",

  links: {
    github: "",
    linkedin: "",
    instagram: "",
  },
} as const;
export const HERO_IMAGE = {
  src: "/products/eco-lounge-chair.png",
  alt: "Eco Lounge Chair — recycled-plastic shell, oak frame",
};