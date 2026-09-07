# UnifyVersion1

A personal collection of standalone web pages and small apps — games, tools,
dashboards, story pages, maps. There is no build step, no framework, no
`package.json`, no dependency install. Every page stands entirely on its own.

## How to build things here

**One self-contained HTML file per project.** HTML, CSS and JavaScript all
inline in that single file. No separate `.css` or `.js` files, no bundler, no
npm. (`js/` holds shared assets for a couple of older pages — don't add to it
for new work.)

**No external dependencies unless asked.** If a library is genuinely needed,
load it from a CDN with a pinned version. Never a local install.

**Always produce the complete file, not a diff or a fragment.** Aaron prefers
whole files — it reduces errors and makes review straightforward.

**Plain, readable JavaScript.** It should still make sense in six months. No
clever abstractions, no transpiled syntax that needs tooling to run.

**Works on a phone as well as a desktop.** Responsive layout is expected, not
a bonus.

**Test it before calling it done.** Verify the logic actually runs — check game
rules, edge cases, and computed results rather than assuming. Say plainly if
something doesn't work.

## Where files go

| Folder   | Contents                        |
|----------|---------------------------------|
| `Games/` | Games                           |
| `Kids/`  | Children's pages and activities |
| `Maps/`  | Map-based pages                 |
| root     | Everything else                 |

Ask if the right home isn't obvious.

## Hosting

GitHub Pages is enabled and serves this repo via
`.github/workflows/static.yml`, which deploys the **entire repository** on
every push to `main`. Anything merged to `main` is live within a minute or two
at:

```
https://aaronunify2.github.io/UnifyVersion1/<path>/<file>.html
```

Files on other branches are **not** published. Only `main` is deployed.

## Workflow

- Develop on the assigned working branch and commit with a clear message.
- Merge into `main` when the work is done. **No pull request is needed** for
  Aaron's own projects unless he explicitly asks for one.
- After merging, send him the live Pages URL so he can test and share it.
