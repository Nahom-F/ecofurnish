# Replacing Images (Copyright-Safe)

I can't fetch images from general websites myself — my sandbox only has
network access to package registries (npm, pip, etc.), not image sites —
so this has to be a "here's exactly what to grab and where it goes" guide
rather than something I can do end-to-end. The good news: it's a small,
contained list.

## Already safe — no action needed

These are generic template/UI graphics from the original scaffold (a gray
"no image" icon, a generic user silhouette, favicons), not photography.
I checked them directly — nothing to worry about here:

- `public/placeholder.jpg`, `placeholder-user.jpg`, `placeholder.svg`,
  `placeholder-logo.png`, `placeholder-logo.svg`
- `public/icon.svg`, `icon-dark-32x32.png`, `icon-light-32x32.png`,
  `apple-icon.png`

I also deleted a few things while I was in there: a duplicate copy of the
product images that had been sitting in `public/images/products/`
(unused — the live site reads `public/products/` instead), the old blurry
225×225 hero placeholder, and an unused `hero-furniture.png`. Less to
track.

## Needs real, licensed photos (10 files)

**Where to get them:** [Unsplash](https://unsplash.com),
[Pexels](https://pexels.com), and [Pixabay](https://pixabay.com) are the
three I'd trust — every photo on those sites is free for commercial use
with no attribution required, by the platform's own license terms. Avoid
just grabbing images from Google Images search results or random
furniture sites — that's the exact "which website did this come from"
risk you're trying to get away from, since you can't tell what license
those carry.

**How to swap them:** download your chosen replacement, rename it to
match the filename below exactly, and drop it in the same folder,
overwriting the old one. No code changes needed — everything reads these
by filename.

| File | Used for | Search for |
|---|---|---|
| `public/images/categories/bedroom.jpg` | "Shop by Category" | modern bedroom furniture |
| `public/images/categories/living-room.jpg` | "Shop by Category" | modern living room furniture |
| `public/images/categories/office.jpg` | "Shop by Category" | modern home office furniture |
| `public/products/eco-bar-stool.png` | Catalog + hero-adjacent | bar stool product photo, white background |
| `public/products/eco-lounge-chair.png` | Catalog + **currently your hero image** | lounge armchair product photo, white background |
| `public/products/garden-bench.png` | Catalog | outdoor wooden bench product photo |
| `public/products/recycled-coffee-table.png` | Catalog | coffee table product photo, white background |
| `public/products/work-desk.png` | Catalog | office desk product photo, white background |
| `public/products/modular-shelf.png` | Catalog | modular shelving unit product photo |
| `public/products/plant-stand.png` | Catalog | plant stand product photo, white background |

## A better long-term option for the product photos specifically

Stock photos work fine for the two category/lifestyle shots, but for the
7 actual product images, generic stock furniture won't match each
listing's specific name, description, and plastic-diverted number — it'll
look like a mismatch to anyone paying attention (a customer or a client
reviewing your portfolio). Two real options once you're past the "just
get this working" stage:

1. **AI-generated product renders** — tools like Midjourney or DALL·E can
   generate consistent, on-brand studio-style product shots you actually
   have rights to, since you created them. This is genuinely a good fit
   here — your original 7 images look AI-generated already (consistent
   lighting, slightly stylized), so this would match the existing style.
2. **Real photography** — once you have (or are simulating) real
   inventory, actual product photos are the correct long-term answer.

For a portfolio piece, option 1 is fast and gets you fully custom,
copyright-clean images that actually match your brand story.
