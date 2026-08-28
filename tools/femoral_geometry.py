"""The size-8 femoral component's articular surface, as a field to build against.

NOT A MEDICAL DEVICE. This is a thin layer over
`generate_femoral_component_stl.py`, which is the authority on the femoral
component's geometry. Every dimension, design assumption and articular-surface
formula is *imported* from that generator rather than restated here, so a
bearing built against this module conforms to the same surface the femoral STL
is polygonised from, and cannot silently drift out of step with it when the
generator's parameters are edited.

What this module adds is the part the generator has no use for: the articular
envelope as a cheap, poseable signed-distance field, plus the couple of
measurements a mating bearing needs -- where the distal condyle touches, how
tightly it is curved there, and how well it holds a fixed pivot through flexion.

The femoral component's local frame, unchanged from the generator:

    x   medial-lateral, 0 on the sagittal midline (the component is
        mirror-symmetric, so it is neither a left nor a right)
    y   anterior -> posterior. y = 0 is the anterior end of the distal
        resection cut; y = functional_ap is the posterior extent
    z   distal -> proximal. z = 0 is the distal resection cut, so the
        articular surface's distal-most point sits at z = -DISTAL_THICKNESS
"""

from __future__ import annotations

from types import SimpleNamespace

import numpy as np
from scipy.ndimage import map_coordinates

import generate_femoral_component_stl as femoral
from generate_femoral_component_stl import (DISTAL_THICKNESS,  # noqa: F401
                                            RADIUS_SHAPE, SIZES, geometry,
                                            half_width, rounded_intersection,
                                            smoothstep)
from sdf_mesh import polygon_sdf


def articular_profile(g: SimpleNamespace, n: int = 601, shape=None):
    """The generator's sagittal J-curve, plus the tangent angle it was built on.

    Returns (y, z, lam, phi). The generator integrates the curve against phi but
    does not hand it back; the local radius of curvature at phi is
    `lam * interp(phi, knots, RADIUS_SHAPE)`, which is what a bearing has to
    match, so it is returned here.
    """
    y, z, lam = femoral.articular_profile(g, n, shape=shape)
    return y, z, lam, np.linspace(0.0, np.pi, n)


def sagittal_polygon(g: SimpleNamespace, shape=None) -> np.ndarray:
    """The closed sagittal outline of the articular envelope, capped proximally."""
    outer, _box = femoral.build_polygons(g, shape=shape)
    return outer


class ArticularField:
    """Signed distance to the femoral component's articular envelope.

    The envelope is the solid bounded by the articular surface, the M/L edges,
    the intercondylar notch and the proximal rim -- the generator's solid
    *before* it is hollowed out on the resection box and before the fixation
    pegs are added. That is the correct body for clearance work against a tibial
    bearing: the bearing can never reach into the bone-facing cavity, and the
    pegs stand off the cut surface inside it.

    The sagittal part of the field depends only on (y, z), so it is evaluated
    once onto a grid and bilinearly interpolated; that turns each query into a
    handful of array ops instead of a distance test against a 600-edge polygon,
    which is what makes sweeping the component through a flexion arc affordable.
    """

    def __init__(self, g: SimpleNamespace, pitch: float = 0.15, margin: float = 30.0):
        self.g = g
        self.pitch = pitch
        polys = (sagittal_polygon(g, femoral.LATERAL_RADIUS_SHAPE),
                 sagittal_polygon(g, femoral.MEDIAL_RADIUS_SHAPE))
        self.y0 = -g.t_ant - margin
        self.z0 = -DISTAL_THICKNESS - margin
        ny = int(np.ceil((g.functional_ap + margin - self.y0) / pitch)) + 1
        nz = int(np.ceil((g.z_flange + margin - self.z0) / pitch)) + 1
        ys = self.y0 + pitch * np.arange(ny)
        zs = self.z0 + pitch * np.arange(nz)
        yy, zz = np.meshgrid(ys, zs, indexing="ij")
        self.grids = [polygon_sdf(yy, zz, poly) for poly in polys]
        self.shape = (ny, nz)

    def sagittal(self, y, z, grid):
        """Interpolated distance to the sagittal outline, valid outside the grid.

        Queries beyond the grid are clamped to its edge and the distance back to
        the clamped point is added. The grid is padded by `margin` mm of
        solid-free space, so the clamped sample is always a positive (outside)
        distance and the sum stays a conservative under-estimate of the true
        distance -- never reporting clearance where there is none.
        """
        y, z = np.broadcast_arrays(y, z)
        fy = (y - self.y0) / self.pitch
        fz = (z - self.z0) / self.pitch
        cy = np.clip(fy, 0.0, self.shape[0] - 1.0)
        cz = np.clip(fz, 0.0, self.shape[1] - 1.0)
        d = map_coordinates(grid, np.stack([cy.ravel(), cz.ravel()]),
                            order=1, mode="nearest").reshape(y.shape)
        return d + self.pitch * np.hypot(fy - cy, fz - cz)

    def __call__(self, x, y, z):
        """The articular envelope, straight out of the femoral generator.

        Every term here comes from `generate_femoral_component_stl`; nothing
        about the component's shape is restated in this module. That matters:
        this field is what a mating bearing is designed against and verified
        with, so a local copy of any one of these formulas would let the
        bearing be checked against a femoral component that no longer exists.
        """
        g = self.g
        hw = half_width(y, z, g)
        # The two condyles no longer share a sagittal profile, so the field has
        # to blend them exactly as the generator's mesh does.
        lat, med = (self.sagittal(y, z, grid) for grid in self.grids)
        w = femoral.sagittal_weight(x)
        d_sagittal = lat + (med - lat) * w
        d = rounded_intersection(
            d_sagittal + femoral.coronal_offset(g, x, y, hw),
            np.abs(x) - hw, femoral.EDGE_RADIUS)
        d = rounded_intersection(d, z - femoral.rim_height(g, x, y, hw),
                                 femoral.RIM_RADIUS)
        return np.maximum(d, -femoral.notch_field(g, x, y))


def distal_contact(g: SimpleNamespace):
    """The distal-most point of the J-curve and the radius of curvature there.

    This is the point that rests on the bearing in full extension, and the
    centre of curvature above it is what a medial-pivot bearing pivots about.
    """
    shape = femoral.MEDIAL_RADIUS_SHAPE
    y, z, lam, phi = articular_profile(g, shape=shape)
    i = int(np.argmin(z))
    knots = np.linspace(0.0, np.pi, len(shape))
    radius = lam * np.interp(phi[i], knots, shape)
    return float(y[i]), float(z[i]), float(radius)


def coronal_radius(g: SimpleNamespace, field: ArticularField,
                   span: float = 9.0, side: float = 1.0) -> float:
    """Radius of the condyle's coronal profile at the distal contact.

    Measured off the articular field rather than assumed. `side` picks the
    condyle: +1 medial, -1 lateral. The two differ -- the medial condyle is
    spherical so that a medial-pivot bearing's socket survives axial rotation --
    so a bearing has to take its two dishes from the two separate numbers.
    """
    y_c, z_c, _ = distal_contact(g)
    x_cond = side * 0.5 * (g.notch_hw + half_width(y_c, z_c, g))
    x = np.linspace(x_cond - span, x_cond + span, 121)
    z = np.linspace(z_c - 4.0, z_c + 8.0, 481)
    d = field(x[:, None], np.full((1, 1), y_c), z[None, :])
    surface = np.array([z[np.argmax(row <= 0.0)] for row in d])

    a = np.stack([x, surface, np.ones_like(x)], axis=1)
    sol, *_ = np.linalg.lstsq(a, x ** 2 + surface ** 2, rcond=None)
    xc, zc = sol[0] / 2.0, sol[1] / 2.0
    return float(np.sqrt(sol[2] + xc ** 2 + zc ** 2))


def contact_lift(g: SimpleNamespace, flexion_deg):
    """How far the articular surface lifts off a fixed distal pivot, per angle.

    Rotating the component about the centre of curvature of its distal condyle
    keeps contact only while the J-curve stays at that distance from the pivot.
    A multi-radius curve does not, so this returns the gap that opens up -- the
    number that says how far a medial-pivot bearing can track this femoral
    before the femur has to translate or descend to stay in contact.
    """
    y, z, lam, _ = articular_profile(g, shape=femoral.MEDIAL_RADIUS_SHAPE)
    y_c, z_c, radius = distal_contact(g)
    d = np.hypot(y - y_c, z - (z_c + radius))
    alpha = np.arctan2(y - y_c, -(z - (z_c + radius)))
    theta = np.radians(np.asarray(flexion_deg, dtype=float))
    reach = (d[None, :] * np.cos(alpha[None, :] - theta[:, None])).max(axis=1)
    return radius - reach
