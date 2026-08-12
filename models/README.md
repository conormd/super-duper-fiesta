# Models

3D reference geometry for OrthoID.

## `generic-bone-plate.stl`

A generic contoured bone plate with six countersunk screw holes.

> **Not a medical device.** This is a made-up teaching shape. It is not derived
> from, and does not represent, any manufacturer's product, and it carries no
> validated dimensions. Do not use it for clinical planning, implant sizing,
> templating, or fabrication of anything placed in a patient.

| | |
| --- | --- |
| Overall length | 96 mm |
| Width | 12 mm |
| Thickness | 3.6 mm |
| Sagittal contour radius | 250 mm (concave undersurface) |
| Screw holes | 6 × ⌀3.5 mm, 15 mm pitch, 90° countersink |
| Volume | 3726 mm³ (≈16.5 g in Ti-6Al-4V) |
| Mesh | 303,352 triangles, watertight, binary STL, millimetre units |

### Regenerating

The mesh is produced from a signed distance field by
[`tools/generate_implant_stl.py`](../tools/generate_implant_stl.py); edit the
parameters at the top of that file to change the geometry.

```bash
pip install numpy scikit-image
python3 tools/generate_implant_stl.py                 # default 0.15 mm sampling
python3 tools/generate_implant_stl.py -r 0.25 -o out.stl   # coarser, smaller file
```

The script reports triangle count, bounding box, volume, and a watertightness
check so a regenerated mesh can be sanity-checked before use.
