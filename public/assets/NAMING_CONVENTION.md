# Asset File Naming Convention

This document outlines the standardized naming convention for all asset files in the English Learning Town project.

## Overview

All asset files follow a **kebab-case** naming convention to ensure consistency, readability, and compatibility with web development best practices.

## Core Rules

### 1. Kebab-Case Format
- Use lowercase letters only
- Replace spaces with hyphens (`-`)
- Use hyphens to separate words and numbers
- No underscores or camelCase

### 2. Number Pattern
- **Format:** `xxx-digits` (not `xxxdigits`)
- **Examples:**
  - ✅ `wall-1.png`, `wall-2.png`, `wall-10.png`
  - ✅ `floor-1.png`, `floor-2.png`, `floor-12.png`
  - ✅ `water-summer-shallow-1.png`
  - ✅ `waterfall-1.png`, `waterfall-2.png`
  - ❌ `wall1.png`, `floor1.png`, `waterfall1.png`

### 3. Multi-Word Names
- Separate all words with hyphens
- **Examples:**
  - ✅ `grandfather-clock.png`
  - ✅ `wooden-bathtub-large.png`
  - ✅ `animal-wall-decor.png`
  - ✅ `general-store-props.png`
  - ❌ `grandfather clock.png`
  - ❌ `wooden bathtub - large.png`

## Directory Structure

### Character Assets
```
public/assets/shared/characters/
├── attack/
│   ├── spear-1.png
│   ├── spear-2.png
│   └── ...
├── basic/
│   ├── swim-idle.png
│   ├── walk-idle.png
│   └── ...
├── farming/
│   ├── pick-up.png
│   ├── plant-seed.png
│   └── ...
└── premade-character/
    ├── angler/
    │   ├── angler-fishing-casting.png
    │   ├── angler-pick-up.png
    │   └── ...
    ├── blacksmith/
    │   ├── blacksmith-idle.png
    │   └── ...
    └── ...
```

### Tileset Assets
```
public/assets/shared/tilesets/
├── props/
│   ├── bridge-stone.png
│   ├── deck-post.png
│   └── ...
├── house/
│   ├── chimney-snowy.png
│   └── ...
├── tileset/
│   ├── dirt-dark.png
│   ├── water-fall-deep-1.png
│   ├── water-icon.png
│   └── ...
└── version-2.0/
    ├── tileset/
    │   ├── dirt/
    │   │   ├── dirt-1.png
    │   │   ├── dirt-2.png
    │   │   └── ...
    │   ├── fall/
    │   │   ├── fall-1.png
    │   │   ├── fall-2.png
    │   │   └── ...
    │   └── ...
    └── house/
        ├── house-1.png
        └── ...
```

### Props Assets
```
public/assets/shared/props/
├── ore-n-gems/
│   ├── ore-n-gems--all.png
│   └── ...
├── cow/
│   ├── calf-1-grazing.png
│   └── ...
├── crops/
│   ├── bell-pepper-green.png
│   └── ...
├── props/
│   ├── all-props.png
│   ├── chest-basic-1.png
│   ├── breakable-platform.png
│   └── ...
└── tilesets/
    ├── ava-bulb-1.png
    ├── ava-deep-1.png
    └── ...
```

### Scene Assets
```
public/assets/scenes/
├── interiors/
│   ├── cafe/
│   │   ├── floor/
│   │   │   ├── floor-1.png
│   │   │   ├── floor-2.png
│   │   │   └── ...
│   │   ├── wall/
│   │   │   ├── wall-1.png
│   │   │   ├── wall-2.png
│   │   │   └── ...
│   │   ├── props/
│   │   │   ├── fireplace-1.png
│   │   │   ├── grandfather-clock.png
│   │   │   ├── wooden-bathtub-large.png
│   │   │   └── ...
│   │   └── cafe.tmj
│   ├── library/
│   ├── school/
│   └── shop/
└── town/
    ├── tileset/
    │   ├── dirt/
    │   │   ├── dirt-dark.png
    │   │   ├── dirt-path-dark.png
    │   │   └── ...
    │   ├── water/
    │   │   ├── fall/
    │   │   │   ├── deep/
    │   │   │   │   ├── water-fall-deep-1.png
    │   │   │   │   ├── water-fall-deep-2.png
    │   │   │   │   └── ...
    │   │   │   └── shallow/
    │   │   │       ├── water-fall-shallow-1.png
    │   │   │       └── ...
    │   │   ├── spring/
    │   │   ├── summer/
    │   │   └── waterfall/
    │   └── ...
    └── town.tmj
```

## Special Cases

### 1. Double Hyphens
Some files may contain double hyphens (`--`) when the original name had multiple consecutive spaces or special characters:
- `table--food.png` (from `table- food.png`)
- `ore-n-gems--all.png` (from `ore n gems - all.png`)

### 2. Water Files
Water-related files follow a specific pattern:
- `water-{season}-{depth}-{number}.png`
- Examples: `water-fall-deep-1.png`, `water-spring-shallow-2.png`

### 3. Seasonal Variations
Seasonal tilesets use descriptive names:
- `fall-1.png`, `fall-2.png`
- `spring-1.png`, `spring-2.png`
- `summer-1.png`, `summer-2.png`
- `winter-1.png`, `winter-2.png`

## TMJ File References

All TMJ (Tiled Map JSON) files reference assets using the standardized naming convention:

```json
{
  "tilesets": [
    {
      "image": "wall/wall-1.png",
      "name": "walls"
    },
    {
      "image": "floor/floor-1.png", 
      "name": "floors"
    }
  ]
}
```

## Migration History

This naming convention was established through a comprehensive refactoring process:

1. **Initial kebab-case conversion** - Converted all files with spaces to use hyphens
2. **xxxdigits to xxx-digits conversion** - Updated 256 files from `xxxdigits` to `xxx-digits` pattern
3. **TMJ reference updates** - Ensured all map files reference the correct asset names

## Benefits

- **Consistency**: All files follow the same naming pattern
- **Readability**: Clear separation of words and numbers
- **Web Compatibility**: Kebab-case is the standard for web development
- **Maintainability**: Easy to understand and modify file names
- **Tool Compatibility**: Works well with build tools and version control

## Enforcement

- All new asset files must follow this naming convention
- Existing files have been migrated to comply with these standards
- TMJ files are automatically updated to reference the correct asset names
- Git hooks and linting tools can be configured to enforce these rules

---

*Last updated: December 2024*
*Total files standardized: 500+ asset files across all directories*
