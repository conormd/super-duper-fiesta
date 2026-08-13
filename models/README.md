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
python3 tools/generate_femoral_component_stl.py --size 10
python3 tools/generate_femoral_component_stl.py --size 7 -o models/generic-tka-femoral-size7.stl
python3 tools/generate_implant_stl.py
```

Each generator prints triangle count, achieved dimensions, wall thickness and a
watertightness check, so a regenerated mesh can be sanity-checked before use.

## `generic-tka-femoral-size10.stl` / `generic-tka-femoral-size7.stl`

A generic cruciate-retaining total-knee femoral component, committed at two
sizes (each mesh is ~30–35 MB, so not every size 3–12 the generator supports
is committed; pass `--size` and `-o` to produce another one).

**Envelope scaled to the published Persona CR femoral (standard) size table.**
That table is the only geometry the manufacturer publishes, and it is what the
model reproduces:

| From the published table | Size 7 | Size 7 model | Size 10 | Size 10 model |
| --- | --- | --- | --- | --- |
| Overall A/P | 62.1 mm | 62.07 mm | 68.5 mm | 68.46 mm |
| Functional A/P | 53.0 mm | 53.00 mm | 59.0 mm | 59.00 mm |
| Overall M/L | 69.5 mm | 69.50 mm | 74.8 mm | 74.80 mm |
| Distal thickness | 9 mm | 9.00 mm | 9 mm | 9.00 mm |
| Condyle thickness | 9 mm | 9.00 mm | 9 mm | 9.00 mm |

Everything else is a **design assumption**, invented from generic total-knee
conventions because it is not published:

| Design assumption | Size 7 value | Size 10 value |
| --- | --- | --- |
| Distal / posterior / anterior articular radius | 38.2 / 19.1 / 21.0 mm | 42.1 / 21.1 / 23.2 mm |
| Anterior flange height | 47.7 mm | 53.1 mm |
| Posterior condyle height | 25.4 mm | 28.3 mm |
| Anterior & posterior chamfer length | 11.4 mm | 13.0 mm |
| Intercondylar notch width | 20.9 mm | 22.4 mm |
| Trochlear groove depth | 2.6 mm | 2.6 mm |
| Fixation pegs | 2 × ⌀6 mm, 11 mm long | 2 × ⌀6 mm, 11 mm long |
| Wall thickness (range) | 6.2 – 10.3 mm | 5.9 – 10.3 mm |

The anterior flange height was lengthened from an initial 0.60 fraction of
functional A/P (35.4 mm at size 10) to 0.90 so the flange sweeps past the
resection box before it's cut off (matching how the anterior shield reads on
real CR femoral components), rather than terminating flush with the box. The
extension is tangent-continuous with the articular J-curve, not a separate
flat panel. The flange's proximal tip is domed rather than cut flat: it dips
7 mm towards the M/L edges instead of ending in a straight line across the
width.

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

**Printing.** Size 7: 659,426 triangles, 51.4 cm³. Size 10: 736,218 triangles,
61.9 cm³. Both oriented distal-surface-down with the open (bone-facing) side
up; both will need supports under the anterior flange and the posterior
condyles.

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
