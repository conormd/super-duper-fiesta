#!/usr/bin/env python3
"""Generate a generic orthopaedic bone-plate implant as a binary STL.

The model is a *generic educational reference shape* -- a contoured locking
compression plate with countersunk screw holes. It is not derived from, and
does not represent, any manufacturer's product, and it is not a medical
device. Do not use it for clinical planning, sizing, or fabrication of
anything implanted in a patient.

Geometry is defined as a signed distance field (SDF) and polygonised with
marching cubes, which keeps the perimeter fillets and countersinks smooth and
the resulting mesh watertight.

Usage:
    python3 tools/generate_implant_stl.py [-o OUT.stl] [-r RESOLUTION_MM]
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np

from sdf_mesh import check_watertight, polygonise, write_binary_stl

# --- Plate parameters (millimetres) -----------------------------------------

LENGTH = 96.0          # overall length, tip to tip
WIDTH = 12.0           # overall width
THICKNESS = 3.6        # plate thickness
CONTOUR_RADIUS = 250.0 # sagittal bend radius; larger = flatter plate
EDGE_FILLET = 0.8      # radius breaking the perimeter edges

HOLE_COUNT = 6
HOLE_PITCH = 15.0
HOLE_RADIUS = 1.75           # through-hole (fits a 3.5 mm cortical screw)
COUNTERSINK_DEPTH = 1.05     # 90 deg included angle (45 deg flank)

HOLE_X = [(i - (HOLE_COUNT - 1) / 2.0) * HOLE_PITCH for i in range(HOLE_COUNT)]


def straight_sdf(x: np.ndarray, y: np.ndarray, z: np.ndarray) -> np.ndarray:
    """SDF of the plate before it is contoured. z=0 is the mid-surface."""
    half_w = WIDTH / 2.0
    half_t = THICKNESS / 2.0

    # Stadium outline: a capsule of radius half_w swept along x.
    straight_run = LENGTH / 2.0 - half_w
    qx = np.maximum(np.abs(x) - straight_run, 0.0)
    d_outline = np.hypot(qx, y) - half_w

    # Slab through the thickness.
    d_slab = np.abs(z) - half_t

    # Rounded intersection -> fillets the whole perimeter edge.
    a = d_outline + EDGE_FILLET
    b = d_slab + EDGE_FILLET
    d = (
        np.minimum(np.maximum(a, b), 0.0)
        + np.hypot(np.maximum(a, 0.0), np.maximum(b, 0.0))
        - EDGE_FILLET
    )

    # Screw holes: a cylinder, opening into a countersink cone at the top face.
    cone_start = half_t - COUNTERSINK_DEPTH
    for hx in HOLE_X:
        rho = np.hypot(x - hx, y)
        bore = HOLE_RADIUS + np.maximum(z - cone_start, 0.0)  # 45 deg flank
        d = np.maximum(d, -(rho - bore))

    return d


def contoured_sdf(gx: np.ndarray, gy: np.ndarray, gz: np.ndarray) -> np.ndarray:
    """Evaluate the plate after bending it about a transverse axis.

    The centre of curvature sits below the plate, so the ends curve downwards
    and the bone-facing undersurface is concave -- the way a plate wraps a
    convex diaphysis, with the countersinks on the convex outer face.

    Each query point is mapped back into the straight plate's frame, so the
    bend costs no extra geometry. Distances are distorted by at most
    (half thickness / contour radius) ~= 0.7%, which is far below the sampling
    resolution and does not move the zero level set.
    """
    radial = CONTOUR_RADIUS + gz
    r = np.hypot(gx, radial)
    x = CONTOUR_RADIUS * np.arctan2(gx, radial)  # arc length along the plate
    z = r - CONTOUR_RADIUS                       # height above mid-surface
    return straight_sdf(x, gy, z)


def build_mesh(resolution: float):
    """Sample the SDF and polygonise it. Returns (verts, faces)."""
    # Bounds of the contoured solid, with margin so the field closes on itself.
    margin = 1.5
    bend = LENGTH / 2.0 / CONTOUR_RADIUS
    x_max = CONTOUR_RADIUS * np.sin(bend) + margin
    z_min = -CONTOUR_RADIUS * (1 - np.cos(bend)) - THICKNESS / 2.0 - margin
    z_max = THICKNESS / 2.0 + margin

    xs = np.arange(-x_max, x_max + resolution, resolution, dtype=np.float32)
    ys = np.arange(-(WIDTH / 2.0 + margin), WIDTH / 2.0 + margin + resolution,
                   resolution, dtype=np.float32)
    zs = np.arange(z_min, z_max + resolution, resolution, dtype=np.float32)

    gx, gy, gz = np.meshgrid(xs, ys, zs, indexing="ij")
    vol = contoured_sdf(gx, gy, gz)

    return polygonise(vol, resolution, (xs[0], ys[0], zs[0]))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("-o", "--out", type=Path,
                        default=Path("models/generic-bone-plate.stl"))
    parser.add_argument("-r", "--resolution", type=float, default=0.15,
                        help="sampling resolution in mm (default: 0.15)")
    args = parser.parse_args()

    verts, faces, volume = build_mesh(args.resolution)
    write_binary_stl(
        args.out, verts, faces,
        "Generic orthopaedic bone plate - educational model, not a medical device",
    )

    lo, hi = verts.min(axis=0), verts.max(axis=0)
    print(f"wrote {args.out}")
    print(f"  triangles : {len(faces):,}")
    print(f"  vertices  : {len(verts):,}")
    print(f"  bounds mm : {hi[0]-lo[0]:.2f} x {hi[1]-lo[1]:.2f} x {hi[2]-lo[2]:.2f}")
    print(f"  volume mm3: {volume:.1f}")
    print(f"  watertight: {check_watertight(faces)}")
    print(f"  file size : {args.out.stat().st_size/1e6:.2f} MB")


if __name__ == "__main__":
    main()
