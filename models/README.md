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
pip install numpy scipy scikit-image matplotlib
python3 tools/generate_femoral_component_stl.py --size 10
python3 tools/generate_femoral_component_stl.py --size 8 -o models/generic-tka-femoral-size8.stl
python3 tools/generate_femoral_component_stl.py --size 7 -o models/generic-tka-femoral-size7.stl
python3 tools/generate_implant_stl.py
python3 tools/generate_articular_surface_stl.py --thickness 10 --side right
python3 tools/preview_articular_surface.py
```

Each generator prints triangle count, achieved dimensions, wall thickness and a
watertightness check, so a regenerated mesh can be sanity-checked before use.

## `generic-tka-femoral-size{7,8,10}.stl`

A generic cruciate-retaining total-knee femoral component, committed at three
sizes (each mesh is ~30–35 MB, so not every size 3–12 the generator supports
is committed; pass `--size` and `-o` to produce another one).

**Envelope scaled to the published Persona CR femoral (standard) size table.**
That table is the only geometry the manufacturer publishes, and it is what the
model reproduces:

| From the published table | Size 7 | Size 7 model | Size 8 | Size 8 model | Size 10 | Size 10 model |
| --- | --- | --- | --- | --- | --- | --- |
| Overall A/P | 62.1 mm | 62.07 mm | 63.8 mm | 63.77 mm | 68.5 mm | 68.46 mm |
| Functional A/P | 53.0 mm | 53.00 mm | 55.0 mm | 55.00 mm | 59.0 mm | 59.00 mm |
| Overall M/L | 69.5 mm | 69.50 mm | 71.3 mm | 71.30 mm | 74.8 mm | 74.80 mm |
| Distal thickness | 9 mm | 9.00 mm | 9 mm | 9.00 mm | 9 mm | 9.00 mm |
| Condyle thickness | 9 mm | 9.00 mm | 9 mm | 9.00 mm | 9 mm | 9.00 mm |

Everything else is a **design assumption**, invented from generic total-knee
conventions because it is not published:

| Design assumption | Size 7 value | Size 8 value | Size 10 value |
| --- | --- | --- | --- |
| Distal / posterior / anterior articular radius | 38.2 / 19.1 / 21.0 mm | 39.2 / 19.6 / 21.6 mm | 42.1 / 21.1 / 23.2 mm |
| Anterior flange height | 47.7 mm | 49.5 mm | 53.1 mm |
| Posterior condyle height | 25.4 mm | 26.4 mm | 28.3 mm |
| Anterior & posterior chamfer length | 11.4 mm | 12.0 mm | 13.0 mm |
| Intercondylar notch width | 20.9 mm | 21.4 mm | 22.4 mm |
| Trochlear groove depth | 2.6 mm | 2.6 mm | 2.6 mm |
| Fixation pegs | 2 × ⌀6 mm, 11 mm long | 2 × ⌀6 mm, 11 mm long | 2 × ⌀6 mm, 11 mm long |
| Wall thickness (range) | 6.2 – 10.3 mm | 6.0 – 10.4 mm | 5.9 – 10.3 mm |

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

**Printing.** Size 7: 659,426 triangles, 51.4 cm³. Size 8: 701,218 triangles,
53.4 cm³. Size 10: 736,218 triangles, 61.9 cm³. All oriented
distal-surface-down with the open (bone-facing) side up; all will need
supports under the anterior flange and the posterior condyles.

## `generic-tka-articular-surface-mc-size8-10mm-right.stl`

A generic **medial-congruent tibial articular surface** (the tibial insert /
bearing) for the size-8 femoral component above. Committed at 10 mm thickness
for a right knee; pass `--thickness` and `--side` for others (each mesh is
~15 MB, so only one is committed).

### It conforms because the femoral component carved it

The femoral component's geometry reaches this generator by import, not by
transcription: [`../tools/femoral_geometry.py`](../tools/femoral_geometry.py)
is a thin layer over `generate_femoral_component_stl.py` that adds the
articular envelope as a poseable signed-distance field. Edit the femoral
generator's parameters and the bearing follows; the two cannot drift apart.

The articular surface is not fitted by eye and it is not an idealised sphere
that happens to be about the right size. The femoral articular envelope is
subtracted from a bearing blank, so every point of both dishes is generated by
the femoral surface itself -- including its coronal fall-off and its condylar
edge roll, which no radius fit reproduces. The compartments differ only in how
the femoral component is *moved* while it carves:

| | how it carves | what that gives |
| --- | --- | --- |
| **Medial** | Rotated about the centre of curvature of its own distal condyle, through -5 deg to 120 deg | A rotation about that centre barely enlarges the envelope, so the carve is a deep **congruent socket** that constrains A/P translation |
| **Lateral** | The same envelope, *translated* through a 12 mm posterior excursion | A translation leaves the coronal profile alone but flattens the sagittal one, giving a **relieved channel**: coronally conforming, sagittally flat, free to roll back |

That the medial construction is sound is checked rather than assumed: no point
of the femoral J-curve lies further from that centre of curvature than the
distal radius itself (39.24 mm), so the flexed component can never reach below
the socket the extension pose carves.

### Measured on the committed mesh

| Geometry taken from the size-8 femoral | Femoral | Bearing | Conformity |
| --- | --- | --- | --- |
| Distal sagittal radius | 39.24 mm | 38.98 mm medial | **1.01** |
| | | 127.63 mm lateral | 0.31 |
| Condylar coronal radius | 70.82 mm | 71.31 mm medial | **0.99** |
| | | 81.76 mm lateral | 0.87 |
| Condyle centre lines | +/-23.17 mm | +/-23.17 mm | -- |

The two conformity columns are the whole point of the design: the medial
compartment is congruent, the lateral one is not. The same contrast in plain
distances -- the A/P run over which each compartment stays within 0.25 mm of
its own floor -- is **8.5 mm medial against 21.5 mm lateral**, and 10 mm behind
the floor the medial surface has climbed 1.32 mm while the lateral has climbed
0.00.

| Design assumption | Value |
| --- | --- |
| Overall M/L x A/P | 70.2 x 48.0 mm |
| Overall height | 16.3 mm |
| Polyethylene thickness at the medial socket floor | 10.0 mm |
| Bearing clearance (also the print fit at the socket) | 0.4 mm |
| Anteromedial lip | 6.17 mm above the medial floor |
| Posterolateral wall | 1.61 mm above the lateral floor |
| Lateral relief excursion | 12 mm (4 anterior, 8 posterior) |
| Tibial internal rotation at full flexion | 15 deg |
| Volume | 31.83 cm3 |
| Mesh | 294,886 triangles, watertight |

There is no posterior cruciate cut-out and no intercondylar eminence. The
plateau outline is closed all the way round, and the central corridor between
the two dishes is held flat at the articular floor, so the back of the bearing
is open: nothing stands proud where the lateral condyle has to roll back. All
of the anterior-posterior and rotational restraint therefore comes from the
medial socket alone, which is the medial-congruent principle taken at its word,
and the bearing is designed for a knee with the posterior cruciate sacrificed
even though the femoral component it articulates with is a cruciate-retaining
one.

The remaining wall heights are the medial-congruent design in miniature: a tall
anteromedial lip, because a congruent socket is an A/P constraint and its
anterior lip is what resists anterior femoral translation, and a
posterolateral wall barely above the floor, so the lateral condyle can roll
back over it unobstructed.

**Minimum gap to the femoral component across the sweep: +0.34 mm.** It has to
be >= 0 or the two parts interfere; that it lands just under the 0.4 mm nominal
clearance is marching-cubes discretisation, not contact.

**Known limitations.** A fixed medial pivot only tracks this femoral to about
39 degrees of flexion -- past that the femoral component lifts more than 1 mm
off the pivot, because its J-curve is multi-radius (39.2 mm distally, 24.3 mm
at 135 degrees) rather than the near-single-radius medial condyle a true
medial-pivot system uses. Beyond that the real femur would translate or descend
to stay in contact, which this static model does not resolve, so the
deep-flexion contact position is not modelled, only guaranteed not to
interfere; making the pair track further means flattening `RADIUS_SHAPE` in the
femoral generator, not changing the bearing. The bearing's coronal conformity
is likewise inherited and capped: the femoral condyle is nearly flat coronally
(70.8 mm equivalent radius, against 25-35 mm on a real pair), so the dish
floors are broad and the walls rise abruptly. There is no locking mechanism --
the inferior surface is flat with a chamfered edge, so this models the bearing
surface only, not a tray interface. Laterality comes from the bearing: the
femoral component is mirror-symmetric and so is neither left nor right, while a
medial-congruent bearing cannot be, since its compartments differ. As with the
femoral, the articular surface is plausible, not validated.

**Printing.** Flat-bottomed, so it prints straight onto the bed in the
orientation it is generated in, articular side up, with no supports. At 10 mm
thick nothing overhangs beyond the 0.8 mm base chamfer. If you print the
size-8 femoral too and want them to articulate, print the bearing first and
check the fit: the 0.4 mm modelled clearance is a bearing gap, not a print
allowance, and most FDM processes will eat it. Raise `--clearance` to
0.6-0.8 mm for a pair that actually moves.

![preview](preview-articular-surface-mc-size8.png)

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
