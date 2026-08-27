#!/usr/bin/env python3
"""Generate a generic total-knee femoral component as a binary STL.

NOT A MEDICAL DEVICE, AND NOT A REPRODUCTION OF ANY PRODUCT. This is a
generic research/teaching shape. Its overall envelope is scaled to the
published Persona CR femoral (standard) size table -- overall A/P, functional
A/P, overall M/L, distal thickness and condyle thickness -- because that is
the only geometry the manufacturer publishes. Everything that gives a real
femoral component its function (the articular surface radii, trochlear groove,
notch, fixation features, and the left/right asymmetry) is NOT published and is
invented here from generic total-knee design conventions. Do not use this model
for clinical planning, implantation, or any purpose requiring a validated
articular surface.

Construction: the bone-facing surface is the exact five-cut resection box
(anterior, anterior chamfer, distal, posterior chamfer, posterior). The
articular surface is a multi-radius J-curve, integrated from a prescribed
radius-vs-tangent-angle profile and scaled so the envelope matches the table
exactly. The solid between them is sampled as a signed distance field and
polygonised with marching cubes.

Usage:
    python3 tools/generate_femoral_component_stl.py --size 10
"""

from __future__ import annotations

import argparse
from pathlib import Path
from types import SimpleNamespace

import numpy as np

from sdf_mesh import (check_watertight, polygon_sdf, polygonise,
                      write_binary_stl)

# --- Published Persona CR femoral (standard) dimensions, mm ------------------
# size: (overall A/P, functional A/P, overall M/L)
SIZES = {
    3:  (53.2, 45.0, 62.5),
    4:  (55.6, 47.0, 64.3),
    5:  (57.2, 49.0, 66.0),
    6:  (59.6, 51.0, 67.8),
    7:  (62.1, 53.0, 69.5),
    8:  (63.8, 55.0, 71.3),
    9:  (66.2, 57.0, 73.0),
    10: (68.5, 59.0, 74.8),
    11: (71.1, 61.0, 76.5),
    12: (75.2, 65.0, 77.5),
}
DISTAL_THICKNESS = 9.0
CONDYLE_THICKNESS = 9.0

# --- Design assumptions: NOT from the published table ------------------------
ANT_CHAMFER_FRAC = 0.26     # of the box depth
POST_CHAMFER_FRAC = 0.26
FLANGE_HEIGHT_FRAC = 0.90   # anterior flange height, of functional A/P
PCOND_HEIGHT_FRAC = 0.48    # posterior condyle height, of functional A/P
# Articular radius as a fraction of the largest radius, sampled at tangent
# angles 0, 45, 90, 135, 180 deg round the J-curve. Anterior -> distal ->
# posterior, i.e. a large distal radius closing down over the posterior condyle.
RADIUS_SHAPE = (0.55, 0.85, 1.00, 0.62, 0.50)
NOTCH_HALFWIDTH_FRAC = 0.15  # of overall M/L
NOTCH_APEX_FRAC = 0.42       # of the box depth, from the anterior cut
GROOVE_DEPTH = 2.6           # trochlear groove
GROOVE_SIGMA_FRAC = 0.13
CORONAL_BULGE = 1.6          # trochlear fall-off towards the M/L edges
# The fall-off starts this far out across the half width, so the central
# condylar band stays at full thickness and the published envelope dimensions
# -- which are measured on the condyles, not in the groove -- are hit exactly.
BULGE_START = 0.55
# Coronal radius of each condyle, about its own centre line. Posterior to the
# trochlea the condyles are arcs of this radius rather than a flat band with
# the edges rolled off, which is what the fall-off above gives on its own. It
# matters well beyond appearance: a concave tibial bearing can never rise
# faster than the convex condyle sitting in it, so this radius is the hard
# upper limit on how tightly any mating bearing's dishes may be cupped.
CONDYLE_CORONAL_RADIUS = 30.0
# The arc governs the articulating band only. Carried all the way out to the
# M/L edge it thins the shell until the articular surface meets the distal cut
# and the rim pinches to zero thickness, so outside this fraction of the
# condyle's half width the surface runs out flat to the edge instead.
CONDYLE_ARC_OUTER = 0.75
FLANGE_TAPER = 0.10          # flange narrowing, fraction of half width
POST_TAPER = 0.06
EDGE_RADIUS = 4.0            # condylar edge roll-off
RIM_RADIUS = 0.8             # break on the proximal rim
TIP_TAPER_DEPTH = 7.0        # anterior flange tip: how far the rim dips at the M/L edges
TIP_TAPER_START = 0.40       # fraction of the flange half width where the dip begins
PEG_RADIUS = 3.0
PEG_LENGTH = 11.0
PEG_X_FRAC = 0.20
PEG_Y_FRAC = 0.45


def smoothstep(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def rounded_intersection(a, b, r):
    """Intersection of two fields with the shared edge filleted by radius r."""
    a, b = a + r, b + r
    return (np.minimum(np.maximum(a, b), 0.0)
            + np.hypot(np.maximum(a, 0.0), np.maximum(b, 0.0)) - r)


def smooth_union(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1 - h) + a * h - k * h * (1 - h)


def geometry(size: int) -> SimpleNamespace:
    overall_ap, functional_ap, overall_ml = SIZES[size]
    g = SimpleNamespace(
        size=size,
        overall_ap=overall_ap,
        functional_ap=functional_ap,
        overall_ml=overall_ml,
        half_ml=overall_ml / 2.0,
        # Anterior flange projection ahead of the anterior cut. The table's
        # overall/functional A/P difference is exactly this dimension.
        t_ant=overall_ap - functional_ap,
        # Posterior cut plane; the condyle adds its thickness behind it.
        y_post=functional_ap - CONDYLE_THICKNESS,
    )
    g.y_ac = ANT_CHAMFER_FRAC * g.y_post
    g.y_pc = POST_CHAMFER_FRAC * g.y_post
    g.z_flange = FLANGE_HEIGHT_FRAC * functional_ap
    g.z_pcond = PCOND_HEIGHT_FRAC * functional_ap
    g.notch_hw = NOTCH_HALFWIDTH_FRAC * overall_ml
    g.y_notch = NOTCH_APEX_FRAC * g.y_post
    g.groove_sigma = GROOVE_SIGMA_FRAC * overall_ml
    # Each condyle runs from the edge of the notch out to the M/L edge, so its
    # centre line and half width follow from those two rather than being set.
    g.x_cond = 0.5 * (g.notch_hw + g.half_ml)
    g.cond_hw = 0.5 * (g.half_ml - g.notch_hw)
    g.peg_x = PEG_X_FRAC * overall_ml
    g.peg_y = PEG_Y_FRAC * g.y_post
    return g


def articular_profile(g: SimpleNamespace, n: int = 601):
    """The sagittal articular curve, from the anterior flange round to posterior.

    Parametrised by tangent angle phi: at phi=0 the curve runs distally down the
    anterior flange, at phi=90 deg it runs posteriorly across the distal
    condyle, at phi=180 deg it runs proximally up the back of the posterior
    condyle. Prescribing radius against phi and integrating gives a curvature-
    continuous multi-radius curve; scaling it by lambda makes the total
    anterior-posterior travel equal the published overall A/P.
    """
    phi = np.linspace(0.0, np.pi, n)
    knots = np.linspace(0.0, np.pi, len(RADIUS_SHAPE))
    radius = np.interp(phi, knots, RADIUS_SHAPE)

    def integrate(f):
        return np.concatenate([[0.0], np.cumsum(0.5 * (f[1:] + f[:-1]) * np.diff(phi))])

    y = integrate(radius * np.sin(phi))
    z = integrate(radius * -np.cos(phi))

    lam = g.overall_ap / y[-1]        # anterior-most to posterior-most travel
    y = -g.t_ant + lam * y            # starts on the anterior flange face
    z = lam * z
    z += -DISTAL_THICKNESS - z.min()  # distal-most point sits at -distal thickness
    return y, z, lam


def build_polygons(g: SimpleNamespace):
    """Sagittal outlines: the articular envelope and the resection box."""
    y, z, lam = articular_profile(g)
    g.radius_scale = lam
    z_top = g.z_flange + 6.0

    outer = np.array(
        [(-g.t_ant, z_top)] + list(zip(y, z)) + [(g.functional_ap, z_top)]
    )

    # Five-cut resection box, open proximally (closed well above the component).
    box_top = z_top + 6.0
    box = np.array([
        (0.0, box_top),
        (0.0, g.y_ac),                    # anterior cut meets anterior chamfer
        (g.y_ac, 0.0),                    # anterior chamfer meets distal cut
        (g.y_post - g.y_pc, 0.0),         # distal cut meets posterior chamfer
        (g.y_post, g.y_pc),               # posterior chamfer meets posterior cut
        (g.y_post, box_top),
    ])
    return outer, box


def wall_thickness(g, outer_poly, box_poly):
    """Wall measured perpendicular from the cut surfaces out to the articular one."""
    pts = []
    for i in range(1, len(box_poly) - 2):
        step = np.linspace(0, 1, 800)[:, None]
        pts.append(box_poly[i] + step * (box_poly[i + 1] - box_poly[i]))
    pts = np.vstack(pts)
    pts = pts[(pts[:, 1] >= 0.0) & (pts[:, 1] <= g.z_flange)]
    wall = np.abs(polygon_sdf(pts[:, 0], pts[:, 1], outer_poly))
    return float(wall.min()), float(wall.max())


def half_width(y, z, g):
    """M/L half width: full at the condyles, tapering on the flange and posteriorly."""
    f = 1.0
    f = f - FLANGE_TAPER * smoothstep((z - 0.35 * g.z_flange) / (0.65 * g.z_flange))
    f = f - POST_TAPER * smoothstep((y - 0.6 * g.y_post) / (0.4 * g.y_post + CONDYLE_THICKNESS))
    return g.half_ml * f


def trochlear_weight(g, y):
    """1 across the trochlea, 0 behind the intercondylar notch apex."""
    return 1.0 - smoothstep((y - (g.y_notch - 14.0)) / 14.0)


def coronal_offset(g, x, y, hw):
    """How far the articular surface sits inboard of the sagittal J-curve.

    Anteriorly this is a broad trochlear surface with a central groove and the
    M/L edges rolled away; posteriorly it is two condyles that are genuine arcs
    about their own centre lines, the two blended by the trochlear weight.

    This is the single definition of the component's coronal shape. Anything
    that needs the articular surface -- the mesh here, or a mating bearing's
    clearance check -- has to come through this function, or the two drift.
    """
    troch = trochlear_weight(g, y)
    groove = GROOVE_DEPTH * np.exp(-(x / g.groove_sigma) ** 2) * troch
    falloff = CORONAL_BULGE * smoothstep(
        (np.abs(x) - BULGE_START * hw) / ((1.0 - BULGE_START) * hw))
    u = np.clip(np.abs(x) - g.x_cond, -g.cond_hw, CONDYLE_ARC_OUTER * g.cond_hw)
    arc = CONDYLE_CORONAL_RADIUS - np.sqrt(
        np.maximum(CONDYLE_CORONAL_RADIUS ** 2 - u ** 2, 0.0))
    return groove + arc * (1.0 - troch) + falloff * troch


def rim_height(g, x, y, hw):
    """Proximal rim, with the anterior flange tip dipping at the M/L edges."""
    flange_weight = 1.0 - smoothstep((y - 0.35 * g.y_post) / (0.30 * g.y_post))
    z_clip = g.z_flange + (g.z_pcond - g.z_flange) * (1.0 - flange_weight)
    tip_dip = TIP_TAPER_DEPTH * flange_weight * smoothstep(
        (np.abs(x) - TIP_TAPER_START * hw) / ((1.0 - TIP_TAPER_START) * hw))
    return z_clip - tip_dip


def notch_field(g, x, y):
    """Intercondylar notch: a rounded U opening posteriorly."""
    rr = 0.85 * g.notch_hw
    na = np.abs(x) - g.notch_hw + rr
    nb = (g.y_notch - y) + rr
    return (np.minimum(np.maximum(na, nb), 0.0)
            + np.hypot(np.maximum(na, 0.0), np.maximum(nb, 0.0)) - rr)


def build_volume(g: SimpleNamespace, resolution: float):
    outer_poly, box_poly = build_polygons(g)

    margin = 2.0
    xs = np.arange(-(g.half_ml + margin), g.half_ml + margin + resolution,
                   resolution, dtype=np.float64)
    ys = np.arange(-(g.t_ant + margin), g.functional_ap + margin + resolution,
                   resolution, dtype=np.float64)
    zs = np.arange(-(DISTAL_THICKNESS + margin), g.z_flange + margin + resolution,
                   resolution, dtype=np.float64)

    # The sagittal fields depend only on (y, z), so evaluate them once.
    yy, zz = np.meshgrid(ys, zs, indexing="ij")
    d_articular = polygon_sdf(yy, zz, outer_poly)
    d_box = polygon_sdf(yy, zz, box_poly)
    g.min_wall, g.max_wall = wall_thickness(g, outer_poly, box_poly)

    hw = half_width(yy, zz, g)

    vol = np.empty((len(xs), len(ys), len(zs)), dtype=np.float32)
    for i0 in range(0, len(xs), 24):
        x = xs[i0:i0 + 24][:, None, None]

        # Articular surface, pushed in by the trochlear groove and by the
        # coronal shape of the trochlea and condyles.
        d = rounded_intersection(d_articular + coronal_offset(g, x, yy, hw),
                                 np.abs(x) - hw, EDGE_RADIUS)

        # Hollow it out on the exact resection box, then trim the proximal rim
        # and open the intercondylar notch.
        d = np.maximum(d, -d_box)
        d = rounded_intersection(d, zz - rim_height(g, x, yy, hw), RIM_RADIUS)
        d = np.maximum(d, -notch_field(g, x, yy))

        # Two fixation pegs standing off the distal cut.
        rho = np.hypot(np.abs(x) - g.peg_x, yy - g.peg_y)
        dr = rho - PEG_RADIUS
        dz = np.abs(zz - PEG_LENGTH / 2.0) - PEG_LENGTH / 2.0
        peg = (np.minimum(np.maximum(dr, dz), 0.0)
               + np.hypot(np.maximum(dr, 0.0), np.maximum(dz, 0.0)) - 0.5)
        d = smooth_union(d, peg, 1.5)

        vol[i0:i0 + 24] = d

    return vol, (xs[0], ys[0], zs[0])


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--size", type=int, default=10, choices=sorted(SIZES))
    parser.add_argument("-o", "--out", type=Path, default=None)
    parser.add_argument("-r", "--resolution", type=float, default=0.25)
    args = parser.parse_args()

    g = geometry(args.size)
    out = args.out or Path(f"models/generic-tka-femoral-size{args.size}.stl")

    vol, origin = build_volume(g, args.resolution)
    verts, faces, volume = polygonise(vol, args.resolution, origin)
    write_binary_stl(
        out, verts, faces,
        f"Generic TKA femoral component size {args.size} - educational model, "
        "not a medical device",
    )

    lo, hi = verts.min(axis=0), verts.max(axis=0)
    print(f"wrote {out}  (size {args.size})")
    print(f"  triangles      : {len(faces):,}")
    print(f"  overall M/L    : {hi[0]-lo[0]:.2f} mm  (table {g.overall_ml})")
    print(f"  overall A/P    : {hi[1]-lo[1]:.2f} mm  (table {g.overall_ap})")
    print(f"  functional A/P : {hi[1]:.2f} mm  (table {g.functional_ap})")
    print(f"  distal thick.  : {-lo[2]:.2f} mm  (table {DISTAL_THICKNESS})")
    print(f"  flange height  : {hi[2]:.2f} mm  (design assumption)")
    print(f"  distal radius  : {g.radius_scale * max(RADIUS_SHAPE):.1f} mm  (design assumption)")
    print(f"  wall thickness : {g.min_wall:.2f} - {g.max_wall:.2f} mm")
    print(f"  volume         : {volume/1000:.2f} cm3")
    print(f"  watertight     : {check_watertight(faces)}")
    print(f"  file size      : {out.stat().st_size/1e6:.2f} MB")


if __name__ == "__main__":
    main()
