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
],
```

Suggested filename convention: `<implant-id>-<ap|lat>.<ext>`.

## Licensing — read before adding anything

**Do not add copyrighted radiographs.** Only add images you have the right to
display:

- Open-access figures under a permissive licence (e.g. **CC BY**) — attribute
  the authors and state the licence.
- Institution-owned teaching-file images you are permitted to publish (ensure
  they are de-identified — no PHI in the image or filename).
- Images you have explicit permission to use.

Always populate `credit` and `license`. Slots with no image render a
placeholder, and every implant also links out to external atlases
(Radiopaedia) from the detail view.
