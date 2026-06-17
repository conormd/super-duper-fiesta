# Reference radiographs

Place locally-hosted reference radiographs here. Files in `public/` are served
at the site root, so an image at `public/radiographs/zb-nexgen-ap.jpg` is
referenced as `/radiographs/zb-nexgen-ap.jpg`.

## Wiring an image to an implant

Add a `views` entry to the implant in `src/data/implants.ts`:

```ts
views: [
  {
    view: 'AP',
    src: '/radiographs/zb-nexgen-ap.jpg',
    caption: 'AP knee, NexGen PS',
    credit: 'Dept. of Radiology, Example Hospital',
    license: 'Used with permission',
    sourceUrl: 'https://example.org/case/123',
  },
  { view: 'Lateral', src: '/radiographs/zb-nexgen-lat.jpg', credit: '…', license: '…' },
  { view: 'Templating', src: '/radiographs/zb-nexgen-tmpl.jpg', credit: '…', license: 'Hospital templating export' },
],
```

## Filename convention

`<implant-id>-<ap|lat|tmpl>.<ext>`

| Suffix | Slot |
|--------|------|
| `-ap`  | AP (anteroposterior) |
| `-lat` | Lateral (mediolateral) |
| `-tmpl`| Templating |

A complete manifest listing all 62 built-in implants and their expected
filenames is in `MANIFEST.csv` in this folder.

## Licensing — read before adding anything

**Do not add copyrighted radiographs.** Only add images you have the right to
display:

- Open-access figures under a permissive licence (e.g. **CC BY**) — attribute
  the authors and state the licence.
- Institution-owned teaching-file images you are permitted to publish (ensure
  they are de-identified — no PHI in the image or filename).
- Templating exports from hospital planning software you are licensed to use
  and permitted to publish.
- Images you have explicit written permission to use.

Always populate `credit` and `license` in the `views` entry. Slots with no
image render a placeholder, and every implant also links out to Radiopaedia
from the detail view.
