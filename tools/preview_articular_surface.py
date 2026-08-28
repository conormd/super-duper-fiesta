#!/usr/bin/env python3
"""Render a conformity preview of the medial-congruent articular surface.

The generator prints the numbers; this draws the thing those numbers are about.
The middle row is the one that matters: the femoral component's own sagittal
J-curve laid over the bearing sections it carved, at three flexion angles. On
the medial side the two curves stay together (a congruent socket); on the
lateral side the bearing falls away beneath the condyle (a relieved channel).

Usage:
    python3 tools/preview_articular_surface.py -o models/preview.png
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

import femoral_geometry as F
import generate_articular_surface_stl as A


def femoral_section(g, x0, jy, jz, deg):
    """The femoral J-curve at that condyle, posed in the bearing frame."""
    theta = np.radians(deg)
    span = np.radians(A.FLEXION_MAX) * A.AXIAL_SATURATION
    psi = -np.radians(A.AXIAL_ROTATION) * A.smoothstep(theta / span)
    _, by, bz = A.to_bearing(g, np.full_like(jy, x0), jy, jz, theta, psi)
    return by, bz


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--thickness", type=float, default=10.0)
    parser.add_argument("-r", "--resolution", type=float, default=0.3)
    parser.add_argument("-o", "--out", type=Path,
                        default=Path("models/preview-articular-surface-mc-size8.png"))
    args = parser.parse_args()

    g = A.geometry(args.thickness, A.CLEARANCE)
    field = F.ArticularField(g.femoral)
    A.attach_coronal_radius(g, field)
    vol, xs, ys, zs = A.build_volume(g, args.resolution, field)
    h = A.top_surface(vol, zs)
    jy, jz, _, _ = F.articular_profile(g.femoral)

    med, lat = "tab:blue", "tab:orange"
    fig = plt.figure(figsize=(13.5, 7.2))
    gs = fig.add_gridspec(3, 3, height_ratios=(0.62, 0.62, 1.5),
                          hspace=0.45, wspace=0.28)

    ax = fig.add_subplot(gs[0:2, 0])
    im = ax.pcolormesh(xs, ys, h.T, cmap="terrain", shading="auto")
    ax.set_title("articular surface height (mm)")
    ax.set_xlabel("x   lateral <- -> medial")
    ax.set_ylabel("y   anterior -> posterior")
    ax.set_aspect("equal"); fig.colorbar(im, ax=ax, fraction=0.046)
    ax.axvline(g.x_cond, c="k", lw=0.7, ls=":")
    ax.axvline(-g.x_cond, c="k", lw=0.7, ls=":")

    ax = fig.add_subplot(gs[0, 1:3])
    for x0, c, lab in ((g.x_cond, med, "medial"), (-g.x_cond, lat, "lateral")):
        i = int(np.argmin(np.abs(xs - x0)))
        ax.plot(ys, h[i], c=c, label=lab)
    ax.set_title("sagittal sections: medial dished, lateral flat")
    ax.set_xlabel("y   anterior -> posterior"); ax.set_aspect("equal")
    ax.grid(alpha=0.3); ax.legend(fontsize=8, loc="upper center", ncol=2,
                                  framealpha=0.9)

    ax = fig.add_subplot(gs[1, 1:3])
    for y0, c in ((-16, "0.2"), (-2, "tab:green"), (12, "tab:red")):
        j = int(np.argmin(np.abs(ys - y0)))
        ax.plot(xs, h[:, j], c=c, lw=1.1, label=f"y = {y0:+d}")
    ax.set_title("coronal sections: walls and the intercondylar eminence")
    ax.set_xlabel("x   lateral <- -> medial"); ax.set_aspect("equal")
    ax.grid(alpha=0.3); ax.legend(fontsize=8, loc="upper center", ncol=3,
                                  framealpha=0.9)

    for k, deg in enumerate((0, 20, 40)):
        ax = fig.add_subplot(gs[2, k])
        for x0, c, lab in ((g.x_cond, med, "medial"), (-g.x_cond, lat, "lateral")):
            i = int(np.argmin(np.abs(xs - x0)))
            ax.plot(ys, h[i], c=c, lw=1.6, label=f"bearing, {lab}")
            by, bz = femoral_section(g, x0, jy, jz, deg)
            ax.plot(by, bz, c=c, lw=1.0, ls="--", label=f"femoral, {lab}")
        ax.set_title(f"femoral component at {deg} deg flexion", fontsize=10)
        ax.set_xlim(-26, 26); ax.set_ylim(7, 27); ax.set_aspect("equal")
        ax.grid(alpha=0.3); ax.set_xlabel("y   anterior -> posterior")
        if k == 0:
            ax.legend(fontsize=7, loc="upper center", ncol=2, framealpha=0.9)

    fig.suptitle(
        f"Generic medial-congruent articular surface, femoral size "
        f"{A.FEMORAL_SIZE}, {args.thickness:g} mm, right knee "
        f"-- educational model, not a medical device", y=0.985)
    fig.subplots_adjust(top=0.92, bottom=0.07, left=0.06, right=0.97)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(args.out, dpi=110)
    print(f"wrote {args.out}  ({args.out.stat().st_size/1e3:.0f} kB)")


if __name__ == "__main__":
    main()
