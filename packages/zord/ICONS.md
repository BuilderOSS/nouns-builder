# Icon Asset Rules

## Directory structure

- `src/assets/monochrome`: icons that inherit color from theme (`currentColor`)
- `src/assets/brand`: icons that intentionally keep fixed brand or multicolor fills/strokes

## Naming

- File names must be kebab-case.
- Icon IDs are derived directly from the file name (without `.svg`).
- Do not add camelCase aliases.

## Monochrome constraints

- Use `currentColor` for visible strokes/fills.
- Do not hardcode color values (`#...`, `rgb(...)`, `black`, `white`) unless transparent/none.
- Prefer simple SVG markup without unnecessary clip paths or masked white backgrounds.

## Brand icon constraints

- Fixed colors are allowed where they are part of the icon identity.
- Keep geometry and color values stable to avoid visual drift.

## Usage guidelines

- Monochrome icons should receive semantic token colors in code (`text1`, `text3`, `positive`, etc.).
- Brand icons should generally not be forced to semantic fills unless specifically required.
