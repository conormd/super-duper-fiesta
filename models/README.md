# Models

Generated 3D reference geometry for OrthoID. Every model here is a **generic
teaching/research shape, not a medical device**, and none is a reproduction of
any manufacturer's product. Do not use them for clinical planning, implant
sizing, templating, or fabrication of anything placed in a patient.

Meshes are binary STL in millimetres, watertight and manifold. They are built
from signed distance fields by the scripts in [`../tools`](../tools) rather
than committed as opaque blobs — edit the parameters at the top of a generator
to change the geometry.

```bash
pip install numpy scikit-image
python3 tools/generate_femoral_component_stl.py --size 7
python3 tools/generate_implant_stl.py
```

Each generator prints triangle count, achieved dimensions, wall thickness and a
watertightness check, so a regenerated mesh can be sanity-checked before use.

## `generic-tka-femoral-size7.stl`

A generic cruciate-retaining total-knee femoral component.

**Envelope scaled to the published Persona CR femoral (standard) size table.**
That table is the only geometry the manufacturer publishes, and it is what the
model reproduces:

| From the published table | Size 7 | Model |
| --- | --- | --- |
| Overall A/P | 62.1 mm | 62.06 mm |
| Functional A/P | 53.0 mm | 53.00 mm |
| Overall M/L | 69.5 mm | 69.50 mm |
| Distal thickness | 9 mm | 9.00 mm |
| Condyle thickness | 9 mm | 9.00 mm |

Sizes 3–12 are all in the generator (`--size`); only size 7 is committed, since
each mesh is ~29 MB. Everything else is a **design assumption**, invented from
generic total-knee conventions because it is not published:

| Design assumption | Size 7 value |
| --- | --- |
| Distal / posterior / anterior articular radius | 38.2 / 19.1 / 21.0 mm |
| Anterior flange height | 31.8 mm |
| Posterior condyle height | 25.4 mm |
| Anterior & posterior chamfer length | 11.4 mm |
| Intercondylar notch width | 20.9 mm |
| Trochlear groove depth | 2.6 mm |
| Fixation pegs | 2 × ⌀6 mm, 11 mm long |
| Wall thickness (range) | 6.2 – 10.3 mm |

Construction: the bone-facing surface is the exact five-cut resection box
(anterior, anterior chamfer, distal, posterior chamfer, posterior). The
articular surface is a multi-radius J-curve, integrated from a prescribed
radius-vs-tangent-angle profile and scaled so the envelope lands on the table.

**Known limitations.** The model is mirror-symmetric about the sagittal
midline, so it is neither a left nor a right component; real femoral components
are side-specific and have a lateralised trochlear groove. There are no
fixation-surface features (porous coating, cement pockets) and no box or cam.
The articular surface is plausible, not validated — it is not suitable for
contact-mechanics or wear work without independent verification.

**Printing.** 586,150 triangles, 43.6 cm³, oriented distal-surface-down with
the open (bone-facing) side up. It will need supports under the anterior
flange and the posterior condyles.

## `generic-bone-plate.stl`

A generic contoured bone plate with six countersunk screw holes. Entirely
invented dimensions — no manufacturer data is involved.

| | |
| --- | --- |
| Overall length × width × thickness | 96 × 12 × 3.6 mm |
| Sagittal contour radius | 250 mm (concave undersurface) |
| Screw holes | 6 × ⌀3.5 mm, 15 mm pitch, 90° countersink |
| Volume | 3726 mm³ (≈16.5 g in Ti-6Al-4V) |
| Mesh | 303,352 triangles |
