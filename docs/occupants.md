# Pond occupants

The pond currently knows two occupant types: `koi` and `blossom`. The page reads the list from browser preferences or local `config.yml`; URLs do not override it.

Hosts choose the same list when creating the engine:

```js
const pond = createPond({
  canvas,
  palette,
  occupants: ["koi", "blossom"]
});
```

Use `addOccupant`, `removeOccupant` and `setOccupants` to change the list at runtime. `PondOccupant` contains the supported names, and `PondInteractions` describes the built-in paw and food responses.

## Absolute size and relative scale

Every occupant separates its absolute `size` from its relative `scale`. Absolute size uses one global `1–100` domain: koi default to `75`, while petals default to `8`, preserving their different orders of magnitude.

Relative scale is standardized to levels `1–5`. The exported enum value `PondScale.RANDOM` gives every instance a deterministic seeded level across the full range. A numeric level locks the type; an array such as `[1, 3, 5]` selects deterministically from that set.

The five globally enforced levels map to multipliers `0.85`, `0.925`, `1`, `1.075`, and `1.15`. Every current and future occupant uses this same curve. It keeps variation visible without allowing random scaling alone to collapse an occupant below the resolution its configured base size was designed for.

Set absolute sizes and relative scales independently:

```js
createPond({
  occupantSize: {
    koi: 82,
    blossom: 8
  },
  occupantScale: {
    koi: 4,
    blossom: [1, 3, 5]
  }
});
```

Absolute sizes and the final logical size are globally clamped to `1–100`; the bound is exported as `PondSizeBounds`. Koi retain the original renderer's visual scale: logical size `75` at scale level `3` maps to the legacy `154px` midpoint of its former `128–180px` range. Other occupant renderers interpret the same logical domain according to their geometry. Invalid values fall back to type defaults. Numeric scales and list entries are rounded and clamped to `1–5`; duplicates are removed, while invalid or omitted scales use `random`. Read the resolved configuration from `pond.scaleLevels`; instances expose logical `size`, chosen `scaleLevel`, and rendered `physicalSize` through `pond.fish` and `pond.blossoms`.

## Population volume

A pond containing one occupant type uses its full population. Mixed ponds automatically multiply each type by `1 / √types` so neither overwhelms the view.

Override the multiplier globally:

```js
createPond({ occupantVolume: 1.2 });
```

Or set it by type:

```js
createPond({
  occupantVolume: {
    koi: 0.8,
    blossom: 1.5
  }
});
```

Volume multipliers for every occupant are globally clamped to `0.25–3`. The shared bound is exported as `PondVolumeBounds`; read effective per-occupant values from `pond.volumes`. The separate `most` option sets the underlying koi cap before the multiplier is applied.
