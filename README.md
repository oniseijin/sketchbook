# sketchbook — interactive sketches by Ryan Mills

Two pages, two stories, both live at
**https://oniseijin.github.io/sketchbook/**

## The Unit Circle (`unit-circle/`) — 2018/2019, for my daughter

In 2018 I set out to build a little starship game and discovered I'd forgotten
the geometry it needed. So before writing the game, I wrote this: a unit circle
you can push around until sine, cosine and tangent stop being formulas and
start being shapes. It worked — the game became
[Starships](https://github.com/oniseijin/starships). Now it's here for my
daughter, who needs that same geometry right now.

- Original Java-mode sketch: Processing, Feb 2018 (published as
  [OpenProcessing sketch 510296](https://www.openprocessing.org/sketch/510296))
- p5.js port: Apr 2019
- Inspired by [mathsisfun.com/sine-cosine-tangent](https://www.mathsisfun.com/sine-cosine-tangent)

## Fractal Lightning (`lightning/`) — 2026, for a room wall

A neon lightning canvas recreated from pure math — no image data. Recursive
midpoint displacement (fractional Brownian motion) makes the bolts, children
spawn as smaller copies of their parents (the collage theorem makes the
branching), and the glow is three halo widths plus a hot body plus a
near-white core, all additive over black. Gaussian spray speckle supplies the
chalk fuzz. Tap the sky for a new seed; the palette dots retint it.

The desktop sibling — a Processing sketch with a 4x print renderer — lives in
my private archive; seed 7 in hot pink is the one on the wall as a print.
Inspired by a hand-painted canvas by TikTok user @peachykayy.

## Running locally

Any static server works (`python3 -m http.server`), then open the page.
Opening `index.html` straight from Finder does **not** work — browsers refuse
local script loading on `file://`, which is the entire reason this repo
exists as a hosted site.

## License

MIT — see [LICENSE](LICENSE).
