# README conventions inherited from ASCII Koi

This file documents the upstream README structure retained by the fork. ASCII Pond may diverge where its installation, occupant system, and attribution require different content.

```markdown
# <Product name>

**<One sentence: what it does for you, in plain words.>** <One or two sentences on what makes it this family: text characters, the same pond.js, the black cat.>

<p align="center">
  <img src="media/<preview>" alt="<What the image shows, frame by frame if it moves>" width="100%">
</p>

<p align="center"><a href="<live demo or install>"><b>▶ <Main action></b></a> &nbsp;·&nbsp; <a href="#install">Install</a></p>

## Install
<Copy-paste commands, one per code block. Then the one step that makes it appear.>

## What you get
<A table: where or what, and what you see.>

## How it works
<Which original code it reuses, and how. A file table.>

<!-- family:start -->
<!-- family:end -->

## License

MIT.
```

- **Lineage block.** Keep the two markers. In this fork, `docs/family.md` acknowledges the upstream project and describes ASCII Pond's additions. Review generated changes before running the inherited `scripts/family.mjs` workflow against sibling repositories.
- **Repository name.** This fork is `ascii-pond`; do not replace setup links with the upstream `ascii-koi` clone URL.
- **Description.** One plain sentence about what the user gets, no emoji.
- **Topics.** Always `ascii-koi` and `ascii-art`, then what the product runs on, for example `codex`, `claude-code`, `n8n`.
- **Media.** Rendered from the real code, never mocked up. Keep the black water (`#0d1315`) as the background.
