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
import struct
from pathlib import Path

import numpy as np
from skimage import measure

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

    # The solid must not touch the sampling box, or the mesh would be open.
    boundary = min(
        vol[0].min(), vol[-1].min(),
        vol[:, 0].min(), vol[:, -1].min(),
        vol[:, :, 0].min(), vol[:, :, -1].min(),
    )
    if boundary <= 0:
        raise RuntimeError("solid reaches the sampling boundary; increase margin")

    verts, faces, _, _ = measure.marching_cubes(
        vol, level=0.0, spacing=(resolution, resolution, resolution)
    )
    verts += np.array([xs[0], ys[0], zs[0]], dtype=verts.dtype)

    # Where the surface grazes a grid vertex, marching cubes can emit two
    # distinct vertices at the same position, leaving a few zero-area faces.
    # Weld the coincident vertices first -- those faces then have a repeated
    # index, so dropping them cancels both copies of their collapsed edge and
    # the mesh stays closed. (Deleting them without welding tears holes.)
    verts, inverse = np.unique(verts, axis=0, return_inverse=True)
    faces = inverse.ravel()[faces]
    repeated = (
        (faces[:, 0] == faces[:, 1])
        | (faces[:, 1] == faces[:, 2])
        | (faces[:, 0] == faces[:, 2])
    )
    faces = faces[~repeated]

    # Orient faces outward: a closed mesh with outward normals encloses a
    # positive signed volume.
    tris = verts[faces]
    signed_volume = np.einsum(
        "ij,ij->i", tris[:, 0], np.cross(tris[:, 1], tris[:, 2])
    ).sum() / 6.0
    if signed_volume < 0:
        faces = faces[:, ::-1]
        signed_volume = -signed_volume

    return verts, faces, signed_volume


def check_watertight(faces: np.ndarray) -> bool:
    """Every edge of a closed manifold surface is shared by exactly 2 faces."""
    edges = np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]])
    edges = np.sort(edges, axis=1)
    _, counts = np.unique(edges, axis=0, return_counts=True)
    return bool((counts == 2).all())


def write_binary_stl(path: Path, verts: np.ndarray, faces: np.ndarray) -> None:
    tris = verts[faces].astype(np.float32)
    normals = np.cross(tris[:, 1] - tris[:, 0], tris[:, 2] - tris[:, 0])
    lengths = np.linalg.norm(normals, axis=1, keepdims=True)
    normals = np.divide(normals, lengths, out=np.zeros_like(normals),
                        where=lengths > 0).astype(np.float32)

    record = np.zeros(
        len(faces),
        dtype=np.dtype([("n", "<f4", 3), ("v", "<f4", (3, 3)), ("attr", "<u2")]),
    )
    record["n"] = normals
    record["v"] = tris

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as fh:
        fh.write(b"Generic orthopaedic bone plate - educational model, not a medical device".ljust(80, b" "))
        fh.write(struct.pack("<I", len(faces)))
        fh.write(record.tobytes())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("-o", "--out", type=Path,
                        default=Path("models/generic-bone-plate.stl"))
    parser.add_argument("-r", "--resolution", type=float, default=0.15,
                        help="sampling resolution in mm (default: 0.15)")
    args = parser.parse_args()

    verts, faces, volume = build_mesh(args.resolution)
    write_binary_stl(args.out, verts, faces)

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
