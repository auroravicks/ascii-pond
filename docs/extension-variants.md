# Extension variants

The unpacked Chromium extension and the hosted page run the same files. Personal extension defaults live in a gitignored `config.yml`; `config.example.yml` is the tracked template.

## Install a variant

1. Clone or download the repository.
2. Copy `config.example.yml` to `config.yml` and edit it using one of the examples below.
3. Open `chrome://extensions` in Chrome, Edge, Brave, Arc or another Chromium browser.
4. Turn on **Developer mode**, choose **Load unpacked**, and select this repository folder.
5. Open a new tab. After later edits, use the extension page's **Reload** button and open another new tab.

No build step is required. Keep the files together; `manifest.json` points the browser's new-tab override at `index.html`.

`config.yml` is loaded from beside `app.js` by the installed extension, so the main page and every `themes/*` page share the same local configuration. Reload the extension after editing it. A page opened directly with a `file://` URL cannot read neighboring files under normal browser security, so direct-file previews use engine defaults.

The three-bar menu stores its occupant selection in browser storage and overrides `config.yml`. This reset is intentionally developer-only: remove the `ascii-koi-occupants` key from the extension's local storage to return control to `config.yml`. URL parameters do not override water or occupant preferences.

## Occupant combinations

Koi only:

```yaml
occupants:
  - koi
koi:
  volume: auto
  size: 75
  scale: random
```

Cherry petals only:

```yaml
occupants:
  - cherry-blossom
cherry-blossom:
  volume: auto
  size: 8
  scale: random
```

Leaves only:

```yaml
occupants:
  - leaf
leaf:
  volume: auto
  size: 12
  scale: random
```

Mixed pond:

```yaml
occupants:
  - koi
  - cherry-blossom
  - leaf
koi:
  volume: auto
  size: 75
  scale: random
cherry-blossom:
  volume: auto
  size: 8
  scale: random
leaf:
  volume: auto
  size: 12
  scale: random
```

An empty file or an empty `occupants` list creates water without occupants. A missing or unreadable `config.yml` uses the built-in default occupants. Unknown names are ignored. The canonical names are exported as `AsciiKoi.PondOccupant`.

## Absolute size and relative scale

`size` establishes an occupant type's absolute order of magnitude on one shared `1–100` domain. Koi default to `75`, leaves to `12`, and cherry petals to `8`. Override it with any number—the engine clamps both the base and final scaled result to that global range:

```yaml
koi:
  size: 82
  scale: random
```

`scale` is separate and standardized across every occupant. It accepts the `random` enum for deterministic per-instance selection across levels `1–5`, a numeric level to lock all instances, or a list for seeded selection from only those levels:

```yaml
koi:
  size: 75
  scale: 4
cherry-blossom:
  size: 8
  scale: [1, 3, 5]
leaf:
  size: 12
  scale: random
```

Absolute and final scaled sizes are globally clamped to `1–100`. Numeric scale levels and list entries are rounded and clamped to `1–5`; duplicates are removed. Different default absolute sizes preserve each occupant's order of magnitude.

For koi, logical size `75` at scale level `3` renders at `154px`, the midpoint of the original project's `128–180px` koi range. This preserves the established visual scale while keeping configuration values on the shared logical `1–100` domain.

## Population volume

Mixed ponds automatically reduce each population so both types remain legible. Override `volume` in the selected occupant's section:

```yaml
koi:
  volume: 0.8
```

Configure mixed occupants independently:

```yaml
koi:
  volume: 0.8
cherry-blossom:
  volume: 1.5
leaf:
  volume: 0.8
```

Volume multipliers for every occupant are globally clamped to `0.25–3`. The engine exports this shared contract as `AsciiKoi.PondVolumeBounds`. Volume affects population, not physical size.

## Engine API

Hosts embedding `pond.js` directly pass the same options to `createPond`. Runtime methods `addOccupant`, `removeOccupant` and `setOccupants` change the active list. Calling `setOccupants` resets simulation time and deterministic state; individual add/remove calls preserve the current timeline.

See [pond occupants](occupants.md) for the complete sizing, volume and runtime API reference.
