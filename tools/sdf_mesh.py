"""Shared helpers for turning a sampled signed distance field into an STL.

Used by the implant model generators in this directory.
"""

from __future__ import annotations

import struct
from pathlib import Path

import numpy as np
from skimage import measure


def polygonise(vol: np.ndarray, spacing: float, origin) -> tuple:
    """Marching-cubes a sampled SDF into a closed, outward-oriented mesh.

    Returns (verts, faces, volume). `vol` must be positive on every face of the
    sampling box, otherwise the surface is left open where it is clipped.
    """
    boundary = min(
        vol[0].min(), vol[-1].min(),
        vol[:, 0].min(), vol[:, -1].min(),
        vol[:, :, 0].min(), vol[:, :, -1].min(),
    )
    if boundary <= 0:
        raise RuntimeError("solid reaches the sampling boundary; increase margin")

    verts, faces, _, _ = measure.marching_cubes(
        vol, level=0.0, spacing=(spacing, spacing, spacing)
    )
    verts = verts + np.asarray(origin, dtype=verts.dtype)

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
    faces = _collapse_slivers(verts, faces)

    # Orient faces outward: a closed mesh with outward normals encloses a
    # positive signed volume.
    tris = verts[faces]
    volume = np.einsum(
        "ij,ij->i", tris[:, 0], np.cross(tris[:, 1], tris[:, 2])
    ).sum() / 6.0
    if volume < 0:
        faces = faces[:, ::-1]
        volume = -volume

    return verts, faces, volume


def _collapse_slivers(verts: np.ndarray, faces: np.ndarray,
                      max_passes: int = 8) -> np.ndarray:
    """Remove zero-area faces whose vertices are distinct but collinear.

    These cannot simply be deleted -- their three edges are each shared with a
    real neighbour, so dropping the face leaves a hole. Collapsing the sliver's
    shortest edge instead merges the offending vertex into its neighbour (a
    sub-sampling-pitch move), which turns the sliver into a repeated-index face
    that can then be dropped without unbalancing any edge.
    """
    parent = np.arange(len(verts))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    corners = ((0, 1), (1, 2), (2, 0))
    for _ in range(max_passes):
        tri = verts[faces]
        area = np.linalg.norm(
            np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]), axis=1)
        slivers = np.flatnonzero(area <= 0)
        if slivers.size == 0:
            break
        for fi in slivers:
            face = faces[fi]
            lengths = [np.linalg.norm(verts[face[i]] - verts[face[j]])
                       for i, j in corners]
            i, j = corners[int(np.argmin(lengths))]
            ra, rb = find(face[i]), find(face[j])
            if ra != rb:
                parent[max(ra, rb)] = min(ra, rb)
        faces = np.array([find(i) for i in range(len(verts))])[faces]
        repeated = (
            (faces[:, 0] == faces[:, 1])
            | (faces[:, 1] == faces[:, 2])
            | (faces[:, 0] == faces[:, 2])
        )
        faces = faces[~repeated]
    return faces


def check_watertight(faces: np.ndarray) -> bool:
    """Every edge of a closed manifold surface is shared by exactly 2 faces."""
    edges = np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]])
    edges = np.sort(edges, axis=1)
    _, counts = np.unique(edges, axis=0, return_counts=True)
    return bool((counts == 2).all())


def write_binary_stl(path: Path, verts: np.ndarray, faces: np.ndarray,
                     header: str) -> None:
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
        fh.write(header.encode("ascii")[:80].ljust(80, b" "))
        fh.write(struct.pack("<I", len(faces)))
        fh.write(record.tobytes())


def polygon_sdf(py: np.ndarray, pz: np.ndarray, poly: np.ndarray,
                block: int = 4096) -> np.ndarray:
    """Exact signed distance to a closed 2D polygon. Negative inside.

    `poly` is (N, 2) in the same (y, z) order as the query arrays; the closing
    edge from the last vertex back to the first is implied.
    """
    shape = py.shape
    pts = np.stack([py.ravel(), pz.ravel()], axis=1).astype(np.float64)
    a = poly.astype(np.float64)
    b = np.roll(a, -1, axis=0)
    edge = b - a
    edge_len2 = np.einsum("ij,ij->i", edge, edge)

    out = np.empty(len(pts))
    for start in range(0, len(pts), block):
        chunk = pts[start:start + block]
        w = chunk[:, None, :] - a[None, :, :]
        t = np.clip(np.einsum("ijk,jk->ij", w, edge) / edge_len2, 0.0, 1.0)
        off = w - t[:, :, None] * edge[None, :, :]
        dist = np.sqrt(np.einsum("ijk,ijk->ij", off, off).min(axis=1))

        # Crossing-number test: count edges the upward ray crosses.
        py_c, pz_c = chunk[:, 0], chunk[:, 1]
        up = (a[None, :, 1] <= pz_c[:, None]) & (pz_c[:, None] < b[None, :, 1])
        dn = (b[None, :, 1] <= pz_c[:, None]) & (pz_c[:, None] < a[None, :, 1])
        straddles = up | dn
        dz = np.where(edge[None, :, 1] == 0, 1.0, edge[None, :, 1])
        cross_y = a[None, :, 0] + (pz_c[:, None] - a[None, :, 1]) / dz * edge[None, :, 0]
        inside = (straddles & (py_c[:, None] < cross_y)).sum(axis=1) % 2 == 1

        out[start:start + block] = np.where(inside, -dist, dist)

    return out.reshape(shape)
