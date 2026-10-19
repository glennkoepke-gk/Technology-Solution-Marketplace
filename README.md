# Facility Tech Solution Marketplace

An original, fully interactive, responsive one-page website based on the supplied **A Logistics Expert's Guide to the Facility of the Future** manuscript (October 2026).

## Open it immediately

Extract the project and double-click `index.html`. No installs, dependencies, or build step required. Chrome, Firefox, Safari and Edge supported.

## Deploy to Vercel

1. Create a new GitHub repository and upload the contents of this folder **to the repository root**.
2. In Vercel, select **Add New → Project**, import the repository, and deploy.
3. Choose **Framework Preset: Other** if prompted. There is no build command, and the output directory is the project root (`.`).
4. Attach your custom domain, if desired. Every git push redeploys automatically.

You can also serve the folder as a static website on any hosting provider. No secrets or back-end services needed.

## Page features

- Custom isometric SVG facility artwork and numbered interactive hotspots.
- All **10** marketplace categories and **68** entries extracted from the source document.
- Fast full-text client-side search across source writeups, category filters, six operational-priority filters, sort, responsive cards and extended profiles.
- Persistent bookmarks/shortlist using local browser storage.
- Compare up to three vendors, with matrix attributes when providers are in the same supported category; download comparison CSV or share URL.
- All **5** capability matrices and **37** matrix rows from the manuscript (unaltered data values).
- Expandable educational field notes derived from the manuscript.
- Responsive designs for desktop, tablet and mobile; keyboard navigation and reduced-motion support.

## Where to edit the content

- `data/catalog.json` — readable, canonical export for editorial review.
- `data/catalog.js` — runtime data file the static site loads.
- `index.html` — structure, headings, calls to action.
- `styles.css` — colors, typography, responsive styles and visual components.
- `app.js` — search, filtering, profiles, saving, comparisons, hotspots and downloadable CSV.
- `assets/facility-hero.svg` — editable vector illustration, drawn specifically for this site.

**Important:** `data/catalog.js` is generated from the document for no-server use. If you edit the JSON, regenerate JS with:

```sh
python -c 'import json,pathlib;p=pathlib.Path("data");(p/"catalog.js").write_text("window.FACILITY_MARKETPLACE_DATA = "+json.dumps(json.loads((p/"catalog.json").read_text()),ensure_ascii=False)+";\\n")'
```

`tools/extract_catalog.py` documents the original DOCX extraction and can be rerun if the source document is present at the specified local path. It is not required in deployment.

## Editorial and compliance notes

- Source information is **as of October 2026**, not a live feed. Vendor maturity, availability, pricing and regulatory conditions must be checked before publication or procurement.
- Vendor claims and comparative descriptions have been reproduced from the provided manuscript, not independently revalidated.
- ``Not stated`` reflects missing source evidence, not evidence of an absent capability.
- Vendor cards use typographic initials, **not reproduced proprietary logos**. The illustrative warehouse/vector art and icon components are newly created and editable.
- The 2025 cargo-theft figure and under-one-minute gate processing statements in the homepage are sourced from the manuscript and intentionally marked with footnote symbols; the original document should be used for verification before public release.
- This site does **not** modify the original Google document or publish a live Vercel deployment; it is a ready-to-deploy project.

## Customizing the brand

Update these CSS variables in `styles.css`:

```css
:root {
  --orange: #ff704b;
  --dark: #0e1219;
  --ink: #131923;
}
```

The main CTA in `index.html` links to `https://www.withvector.com/`; edit it to point to your preferred demo page or campaign tracking link.
