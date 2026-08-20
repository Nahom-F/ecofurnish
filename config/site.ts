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
  // URLs against.
  // Update this (and NEXT_PUBLIC_APP_URL / BETTER_AUTH_URL) together if
  // you move to a different domain later.
  url: "https://ecofurnish.de5.net",

  links: {
    github: "",
    linkedin: "",
    instagram: "",
  },

  // The person who built this site — separate from `links` above, which
  // is EcoFurnish's own (storefront) social presence, not the
  // developer's. 
  developer: {
    name: "NF",
    github: "https://github.com/Nahom-F",
  },
} as const;
export const HERO_IMAGE = {
  src: "/products/eco-lounge-chair.png",
  alt: "Eco Lounge Chair — recycled-plastic shell, oak frame",
};