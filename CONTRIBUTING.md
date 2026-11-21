# Contributing to ASCII Pond

Thanks for helping improve ASCII Pond. This repository is a fork of [pursurer/ascii-koi](https://github.com/pursurer/ascii-koi); preserve upstream attribution when reusing or redistributing the project.

## Set up the project

ASCII Pond uses vanilla JavaScript and has no build step or runtime dependencies.

```sh
git clone https://github.com/auroravicks/ascii-pond.git
cd ascii-pond
```

For the complete new-tab experience:

1. Open `chrome://extensions` in Chrome, Brave, or Arc, or `edge://extensions` in Edge.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this repository folder.
4. Open a new tab.

Reload the unpacked extension after changing source files. You can also open `index.html` directly for a quick preview, but a `file://` page normally cannot load the adjacent `config.yml`.

To test local configuration, copy `config.example.yml` to the gitignored `config.yml`. Browser occupant choices override that file; remove the `ascii-pond-occupants` local-storage key to return control to local configuration. See [extension variants](docs/extension-variants.md).

## Repository structure

| Path | Purpose |
|---|---|
| `pond.js` | Deterministic pond simulation, occupant renderers, interactions, and public engine API |
| `app.js` | Page setup, configuration parsing, browser preferences, controls, and input handling |
| `pond.css` | Theme tokens, layout, controls, and responsive presentation |
| `index.html` | Main page and extension new-tab entry point |
| `themes/` | Theme-locked entry pages |
| `config.example.yml` | Tracked local-configuration template |
| `docs/occupants.md` | Occupant sizing, volume, interactions, and engine API |
| `docs/extension-variants.md` | Installation and YAML configuration guide |

## Development guidelines

- Keep the project dependency-free unless a dependency solves a clear, documented need that cannot reasonably remain local.
- Preserve deterministic behavior. Seeded occupants and fixed-step `seek()` output should produce repeatable results.
- Keep rendering in the shared character-cell visual system. New large swimming occupants should use the spine rasterizer, lighting, shadows, glyphs, and wakes rather than a separate drawing style.
- Treat `size` as the absolute logical `1–100` value and `scale` as the relative `1–5` level or `random` selection. Do not introduce occupant-specific public bounds.
- Keep `volume` inside the shared `0.25–3` contract. Document intentional population floors, such as the arapaima pair.
- Add occupant names to `PondOccupant` and describe their built-in responses in `PondInteractions`.
- Ensure runtime `addOccupant`, `removeOccupant`, and `setOccupants` changes preserve simulation time, scheduled events, and unaffected occupant state.
- Update the side panel, `config.example.yml`, and both occupant documents when adding or renaming an occupant.
- Keep the README focused on installation and user-facing behavior; put engine and configuration detail under `docs/`.

## Public identity

Use the fork's own identifiers throughout integrations and browser preferences:

- `window.AsciiPond` and its exported engine API
- `ascii-pond-theme` and `ascii-pond-occupants` browser-storage keys

Changes to these identifiers require an explicit migration plan and a clearly marked breaking release.

## Validate changes

There is currently no automated test suite. Before opening a pull request:

```sh
node --check pond.js
node --check app.js
git diff --check
```

Then verify the unpacked extension manually:

- Open each pond theme: pond, black, and light.
- Toggle every occupant individually and in a mixed pond.
- Confirm occupant choices survive a new tab.
- Check tap/click, hold/right-click, pause, and water controls.
- Confirm koi seek food, arapaima dive from taps and surface periodically, and surface occupants scatter from the paw.
- Test an empty occupant list and a missing, empty, and populated `config.yml`.
- Reload after resizing the window and check both desktop and narrow layouts.
- If engine runtime methods changed, exercise them during a scheduled `pond.at(...)` sequence and confirm time is not rewound.

Include updated screenshots only when they help reviewers assess a visual change. Do not add generated build output or personal `config.yml` files.

## Documentation and commits

- Update documentation in the same change as behavior or configuration.
- Keep upstream credit and the MIT license intact.
- Use focused commit messages, preferably in imperative Conventional Commit form, such as `feat: add a pond occupant` or `fix: preserve state during occupant changes`.
- Call out breaking configuration or public API changes in the commit body and pull-request description.

Releases follow `YY.MM.N`, where `N` is the first, second, or later major release in that month. Keep the plain-text [RELEASE](RELEASE) file and `manifest.json` version identical, then create the matching `vYY.MM.N` tag.

## Pull requests

A useful pull request explains:

- What changed and why
- Which occupants, themes, or interactions are affected
- How the change was validated
- Any configuration or compatibility impact
- Before-and-after visuals for presentation changes

Keep unrelated cleanup in separate commits or pull requests so behavioral changes remain easy to review.
