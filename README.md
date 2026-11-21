# ASCII Pond

**A configurable ASCII pond for your new tab.** Koi, deep-lurking arapaima, drifting cherry petals, and leaves share a pond drawn entirely in text characters. Open the side panel to choose its occupants, poke the water with a cat paw, or feed the koi.

This repository is a fork of [pursurer/ascii-koi](https://github.com/pursurer/ascii-koi). ASCII Pond keeps the original pond, clock, koi, cat-paw interactions, and deterministic canvas engine while adding multiple occupant types, local YAML configuration, browser-stored occupant controls, shared sizing rules, and premapped interactions.

<p align="center">
  <a href="#install"><b>Install as your new tab</b></a> &nbsp;·&nbsp;
  <a href="docs/extension-variants.md">Configure the pond</a> &nbsp;·&nbsp;
  <a href="RELEASE">Version 26.11.1</a> &nbsp;·&nbsp;
  <a href="https://pursurer.github.io/ascii-koi/">Visit the upstream demo</a>
</p>

## What you can do

| | |
|---|---|
| **Left click** | A black cat paw reaches in from the edge, hooks the water back in two tugs and flicks out a spray of drops. The koi bolt. A moment later the curious ones swim back to look. |
| **Right click** | A handful of fish food. Every pellet lands with its own ring, the hungry koi rise to the surface and race each other to eat. |
| **Tap / hold** | The same on a phone or tablet: tap for the paw, hold for food. |
| **`1` `2` `3` or `T`** | Three waters: **pond** (deep lake teal), **black** and **light**. The new water spreads out like a ripple from where you chose it. |
| **`Space`** | Freeze the pond. |
| **Three-bar menu** | Open the side panel for water, pause, help, and remembered koi, arapaima, cherry-petal, and leaf choices. |

The clock is not a font. It is the outline of Noto Serif Display sampled into character cells: the contour becomes `| / - \` strokes, the strokes become solid tiles, and every koi that swims underneath tints the digits in its own colours while a caustic light net plays across them.

## Install

No build step or package installation is required.

1. Clone this fork, or use **Code → Download ZIP** and extract it:

   ```sh
   git clone https://github.com/auroravicks/ascii-pond.git
   cd ascii-pond
   ```

2. Open your Chromium browser's extension page:

   - Chrome, Brave, or Arc: `chrome://extensions`
   - Edge: `edge://extensions`

3. Enable **Developer mode**, choose **Load unpacked**, and select the `ascii-pond` folder containing `manifest.json`.
4. Open a new tab.

After pulling or editing files, return to the extension page, press **Reload** on ASCII Pond, then open a fresh new tab.

### Optional local configuration

To make a persistent occupant variant, copy `config.example.yml` to the gitignored `config.yml`; see [extension variants](docs/extension-variants.md).

The three-bar menu stores its occupant list in browser storage. Once saved, that list overrides `config.yml`; the developer reset procedure is documented in [extension variants](docs/extension-variants.md).

For a quick preview, open `index.html` directly. Normal browser security prevents a `file://` page from reading adjacent `config.yml`, so direct-file previews use built-in defaults. To exercise local configuration outside the extension, serve the repository with any static file server.

## Make it yours

| URL | What it does |
|---|---|
| `themes/light.html` | A page locked to one water |
| `?title=One%20Page&tag=is%20all%20you%20need` | Your own words instead of the clock |
| `?ui=0` | No controls: a wallpaper, a second screen, a stream background |

## How it works

- **Koi.** Each fish is a chain of ten spine nodes trailing its head, with a travelling body wave. Every character cell is sampled against the nearest point on the spine (plus sub-samples for soft edges), classified as body, fin, eye or barbel, coloured by the fish's own markings (kohaku, sanke, tancho) and shaded by a light from the upper left: lit skin gets sparse glyphs, shadowed skin dense ones. Each koi casts a shadow on the pond floor and leaves a wake.
- **Water.** Two drifting noise fields; where they meet, light gathers in a thin moving net of `· - ~`, and the scales glint `*` where it crosses a back.
- **Deterministic.** The simulation can step forward in fixed 1/60 s increments, so the same scheduled events produce the same frame.
- **Occupants.** Choose koi, deep-lurking arapaima, drifting cherry petals, floating leaves, or any combination. Mixed ponds balance their populations automatically, and every occupant uses the same five-level logical size system. See [occupant configuration](docs/occupants.md).
- **Small.** Vanilla JavaScript, no build step and no runtime dependencies: `pond.js` is the engine, `app.js` owns the page and browser preferences, and two local web fonts complete the presentation.

<!-- family:start -->
## Upstream lineage

ASCII Pond is built on the original ASCII Koi design and remains compatible with its dependency-free browser architecture.

| Project | What it is |
|---|---|
| [ASCII Koi](https://github.com/pursurer/ascii-koi) | **Upstream.** The original pond, clock, koi engine, cat paw, food interaction, themes, and new-tab extension |
| **ASCII Pond** (this repository) | **This fork.** Adds configurable occupants, arapaima, cherry petals, leaves, browser controls, and extension-local YAML configuration |
| [Codex Koi](https://github.com/pursurer/codex-koi) | **In Codex.** The pond behind the Codex desktop app's new-chat page, and the black cat as your Codex pet |
| [One Page is all you need](https://github.com/pursurer/one-page-is-all-you-need) | **In your morning.** A one-page briefing that an n8n agent writes every day, opening on the pond. Where the koi and the cat began |

The related upstream projects retain the original [`ascii-koi`](https://github.com/topics/ascii-koi) family identity.
<!-- family:end -->

## Credits

- Original project and core design: [pursurer/ascii-koi](https://github.com/pursurer/ascii-koi). This fork preserves its MIT license and extends the engine from that foundation.
- Technique informed by [stackedlol/ascii-sharks](https://github.com/stackedlol/ascii-sharks) (MIT) and [daoho.dev](https://daoho.dev); all code here is written for this project.
- Fonts: [Noto Serif Display](https://fonts.google.com/noto/specimen/Noto+Serif+Display) and [Geist Mono](https://github.com/vercel/geist-font), both under the SIL Open Font License (see `fonts/`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, architecture conventions, compatibility requirements, and the manual validation checklist.

## License

MIT. See [LICENSE](LICENSE) for the inherited license text.
