#!/usr/bin/env python3
"""Genera las figuras SVG de los módulos 23, 24, 26 y 27 de Control 1 desde el cálculo real.

Cada curva sale de python-control (no se dibuja a mano) y se escribe con el mismo estilo de las
figuras existentes en web/public/content/figures/control-1/: fondo blanco, rejilla #dde2ea,
ejes #5b6579 y curvas #2557c7 / #d9480f / #1f7a4d.

Requisitos: python3 -m pip install control numpy
Uso: python3 scripts/render_control1_figures.py
"""
from __future__ import annotations

import warnings
from pathlib import Path

import control as ct
import numpy as np

warnings.filterwarnings("ignore")

OUT = Path(__file__).resolve().parents[1] / "web" / "public" / "content" / "figures" / "control-1"
BLUE, ORANGE, GREEN, GRAY, GRID = "#2557c7", "#d9480f", "#1f7a4d", "#5b6579", "#dde2ea"
WIDTH = 640


def fmt(value: float) -> str:
    """Número con coma decimal y sin ceros sobrantes."""
    text = f"{value:.2f}".rstrip("0").rstrip(".")
    return text.replace("-", "−").replace(".", ",")


class Panel:
    """Un área de gráfica con transformación lineal o logarítmica en x."""

    def __init__(self, x0, y0, w, h, xlim, ylim, logx=False):
        self.x0, self.y0, self.w, self.h = x0, y0, w, h
        self.xlim, self.ylim, self.logx = xlim, ylim, logx

    def px(self, x):
        a, b = (np.log10(self.xlim[0]), np.log10(self.xlim[1])) if self.logx else self.xlim
        v = np.log10(x) if self.logx else x
        return self.x0 + (v - a) / (b - a) * self.w

    def py(self, y):
        a, b = self.ylim
        return self.y0 + self.h - (y - a) / (b - a) * self.h

    def path(self, xs, ys, color, width=2.2, dash=None, clip=None):
        pts = " ".join(f"{'M' if i == 0 else 'L'}{self.px(x):.1f} {self.py(y):.1f}" for i, (x, y) in enumerate(zip(xs, ys)))
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        clip_attr = f' clip-path="url(#{clip})"' if clip else ""
        return f'<path d="{pts}" fill="none" stroke="{color}" stroke-width="{width}"{extra}{clip_attr}/>'

    def grid(self, xticks, yticks, xlabels=True, ylabel_fmt=fmt):
        parts = [f'<g stroke="{GRID}">']
        for x in xticks:
            parts.append(f'<line x1="{self.px(x):.1f}" x2="{self.px(x):.1f}" y1="{self.y0}" y2="{self.y0 + self.h}"/>')
        for y in yticks:
            parts.append(f'<line x1="{self.x0}" x2="{self.x0 + self.w}" y1="{self.py(y):.1f}" y2="{self.py(y):.1f}"/>')
        parts.append("</g>")
        parts.append(f'<rect x="{self.x0}" y="{self.y0}" width="{self.w}" height="{self.h}" fill="none" stroke="{GRAY}" stroke-width="1"/>')
        if xlabels:
            for x in xticks:
                parts.append(f'<text x="{self.px(x):.1f}" y="{self.y0 + self.h + 16}" text-anchor="middle" fill="{GRAY}">{fmt(x)}</text>')
        for y in yticks:
            parts.append(f'<text x="{self.x0 - 6}" y="{self.py(y) + 4:.1f}" text-anchor="end" fill="{GRAY}">{ylabel_fmt(y)}</text>')
        return "".join(parts)

    def clip(self, ident):
        return f'<clipPath id="{ident}"><rect x="{self.x0}" y="{self.y0}" width="{self.w}" height="{self.h}"/></clipPath>'


def svg(height, label, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {height}" role="img" aria-label="{label}" '
            f'font-family="IBM Plex Sans, sans-serif" font-size="12"><rect x="0" y="0" width="{WIDTH}" height="{height}" fill="#ffffff"/>'
            f"{body}</svg>\n")


def legend(x, y, items):
    parts = []
    for i, (color, text, dash) in enumerate(items):
        yy = y + i * 18
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        parts.append(f'<line x1="{x}" x2="{x + 24}" y1="{yy}" y2="{yy}" stroke="{color}" stroke-width="2.4"{extra}/>')
        parts.append(f'<text x="{x + 30}" y="{yy + 4}" fill="{color}" font-weight="600">{text}</text>')
    return "".join(parts)


def nyquist() -> str:
    panel = Panel(70, 24, 520, 340, (-2.5, 1.5), (-1.6, 1.6))
    w = np.concatenate([np.linspace(0, 2, 400), np.logspace(np.log10(2.001), 3, 1200)])
    body = [panel.clip("nq"), panel.grid([-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5], [-1.5, -1, -0.5, 0, 0.5, 1, 1.5])]
    body.append(f'<g stroke="{GRAY}" stroke-width="1.3"><line x1="{panel.x0}" x2="{panel.x0 + panel.w}" y1="{panel.py(0):.1f}" y2="{panel.py(0):.1f}"/>'
                f'<line x1="{panel.px(0):.1f}" x2="{panel.px(0):.1f}" y1="{panel.y0}" y2="{panel.y0 + panel.h}"/></g>')
    for K, color in ((30, BLUE), (90, ORANGE)):
        L = ct.tf([K], [1, 6, 11, 6])
        values = L(1j * w)
        body.append(panel.path(values.real, values.imag, color, clip="nq"))
        body.append(panel.path(values.real, -values.imag, color, dash="6 5", width=1.6, clip="nq"))
        cruce = L(1j * np.sqrt(11)).real
        body.append(f'<circle cx="{panel.px(cruce):.1f}" cy="{panel.py(0):.1f}" r="4" fill="{color}"/>')
    body.append(f'<circle cx="{panel.px(-1):.1f}" cy="{panel.py(0):.1f}" r="6" fill="none" stroke="#111827" stroke-width="2"/>')
    body.append(f'<text x="{panel.px(-1) + 10:.1f}" y="{panel.py(0) + 4:.1f}" fill="#111827" font-weight="600">−1</text>')
    body.append(f'<text x="{panel.px(-0.5) + 4:.1f}" y="{panel.py(0) + 26:.1f}" fill="{BLUE}">−0,5</text>')
    body.append(f'<text x="{panel.px(-1.5) - 6:.1f}" y="{panel.py(0) + 18:.1f}" text-anchor="end" fill="{ORANGE}">−1,5</text>')
    body.append(legend(420, 330, [(BLUE, "K = 30 (estable)", None), (ORANGE, "K = 90 (N = 2)", None)]))
    body.append(f'<text x="{panel.x0 + panel.w}" y="{panel.y0 + panel.h + 32}" text-anchor="end" fill="{GRAY}">Re L(jω) · línea discontinua: ω &lt; 0</text>')
    body.append(f'<text x="{panel.x0}" y="16" fill="{GRAY}">Im L(jω)</text>')
    return svg(400, "Diagrama de Nyquist de K/((s+1)(s+2)(s+3)) para K = 30 y K = 90", "".join(body))


def bode_adelanto() -> str:
    G = ct.tf([4], [1, 2, 0])
    sin = 10 * G
    con = 46.1 * ct.tf([1, 4.27], [1, 19.7]) * G
    w = np.logspace(-1, 2, 600)
    mag = Panel(70, 20, 540, 170, (0.1, 100), (-40, 60), logx=True)
    fase = Panel(70, 240, 540, 150, (0.1, 100), (-180, -90), logx=True)
    xt = [0.1, 1, 10, 100]
    body = [mag.grid(xt, [-40, -20, 0, 20, 40, 60], xlabels=False), fase.grid(xt, [-180, -150, -120, -90])]
    body.append(f'<line x1="{mag.x0}" x2="{mag.x0 + mag.w}" y1="{mag.py(0):.1f}" y2="{mag.py(0):.1f}" stroke="{GRAY}" stroke-dasharray="5 5"/>')
    for L, color in ((sin, ORANGE), (con, BLUE)):
        resp = L(1j * w)
        body.append(mag.path(w, 20 * np.log10(np.abs(resp)), color))
        body.append(fase.path(w, np.degrees(np.unwrap(np.angle(resp))), color))
        _, pm, _, wc = ct.margin(L)
        for panel in (mag, fase):
            body.append(f'<line x1="{panel.px(wc):.1f}" x2="{panel.px(wc):.1f}" y1="{panel.y0}" y2="{panel.y0 + panel.h}" stroke="{color}" stroke-dasharray="3 4"/>')
        izquierda = color == ORANGE
        anchor, dx = ("end", -4) if izquierda else ("start", 4)
        body.append(f'<text x="{mag.px(wc) + dx:.1f}" y="{mag.py(0) - 6:.1f}" text-anchor="{anchor}" fill="{color}" font-weight="600">ωc = {fmt(wc)}</text>')
        body.append(f'<text x="{fase.px(wc) + 4:.1f}" y="{fase.py(-180 + pm) - 6:.1f}" fill="{color}">MF = {fmt(round(pm, 1))}°</text>')
    body.append(f'<text x="{mag.x0}" y="14" fill="{GRAY}">Magnitud (dB)</text><text x="{fase.x0}" y="234" fill="{GRAY}">Fase (grados)</text>')
    body.append(f'<text x="{fase.x0 + fase.w}" y="{fase.y0 + fase.h + 32}" text-anchor="end" fill="{GRAY}">ω (rad/s)</text>')
    body.append(legend(90, 150, [(ORANGE, "40/(s(s+2))", None), (BLUE, "con adelanto", None)]))
    return svg(430, "Bode de 40/(s(s+2)) antes y después del compensador de adelanto", "".join(body))


def observador() -> str:
    A = np.array([[0.0, 1], [-2, -3]])
    C = np.array([[1.0, 0]])
    t = np.linspace(0, 2, 801)
    panel = Panel(70, 24, 540, 300, (0, 2), (-0.6, 1.4))
    body = [panel.grid([0, 0.5, 1, 1.5, 2], [-0.4, 0, 0.4, 0.8, 1.2])]
    items = []
    curves = []
    for polos, color, nombre in (([-10, -10], BLUE, "estimación, polos en −10"), ([-1, -1], ORANGE, "estimación, polos en −1")):
        L = np.reshape(ct.acker(A.T, C.T, polos), (2, 1))
        A_aug = np.block([[A, np.zeros((2, 2))], [L @ C, A - L @ C]])
        r = ct.initial_response(ct.ss(A_aug, np.zeros((4, 1)), np.eye(4), 0), T=t, X0=[1, 0, 0, 0])
        curves.append((r.states[2], color))
        items.append((color, nombre, "6 4"))
        x1 = r.states[0]
    body.append(panel.path(t, x1, GREEN, width=2.6))
    for estimado, color in curves:
        body.append(panel.path(t, estimado, color, dash="6 4"))
    body.append(legend(330, 50, [(GREEN, "x₁ real", None)] + items))
    body.append(f'<text x="{panel.x0}" y="16" fill="{GRAY}">x₁ y su estimación</text>')
    body.append(f'<text x="{panel.x0 + panel.w}" y="{panel.y0 + panel.h + 32}" text-anchor="end" fill="{GRAY}">t (s)</text>')
    return svg(370, "Estado x1 y su estimación con un observador rápido y uno lento", "".join(body))


def dos_parametros() -> str:
    t = np.linspace(0, 3, 900)
    D3 = [1, 16, 85, 250]
    D4 = [1, 26, 245, 1100, 2500]
    casos = (
        (ct.tf([44, 224], D3), ORANGE, "un parámetro: Mp 16 %, T(0) = 0,896", None),
        (ct.tf([174, 1054, 2500], D4), GREEN, "un parámetro con integrador: Mp 31 %", None),
        (ct.tf([25, 250], D3), BLUE, "dos parámetros: Mp 9,5 %, T(0) = 1", "7 4"),
    )
    panel = Panel(70, 24, 540, 300, (0, 3), (0, 1.4))
    body = [panel.grid([0, 0.5, 1, 1.5, 2, 2.5, 3], [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4])]
    body.append(f'<line x1="{panel.x0}" x2="{panel.x0 + panel.w}" y1="{panel.py(1):.1f}" y2="{panel.py(1):.1f}" stroke="{GRAY}" stroke-dasharray="5 5"/>')
    for T, color, _, dash in casos:
        r = ct.step_response(T, T=t)
        body.append(panel.path(t, np.squeeze(r.outputs), color, dash=dash))
    body.append(legend(300, 250, [(color, text, dash) for _, color, text, dash in casos]))
    body.append(f'<text x="{panel.x0}" y="16" fill="{GRAY}">y(t) ante escalón unitario</text>')
    body.append(f'<text x="{panel.x0 + panel.w}" y="{panel.y0 + panel.h + 32}" text-anchor="end" fill="{GRAY}">t (s)</text>')
    return svg(370, "Respuesta al escalón con compensador de uno y de dos parámetros", "".join(body))


def main() -> None:
    figuras = {
        "nyquist-tercer-orden.svg": nyquist(),
        "adelanto-bode.svg": bode_adelanto(),
        "observador-error.svg": observador(),
        "dos-grados-libertad.svg": dos_parametros(),
    }
    for nombre, contenido in figuras.items():
        (OUT / nombre).write_text(contenido, encoding="utf-8")
        print("escrita", OUT / nombre)


if __name__ == "__main__":
    main()
