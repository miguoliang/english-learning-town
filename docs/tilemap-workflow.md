# TMJ + TSJ Tilemap Workflow

This document explains how to edit TMJ files using tile definitions from TSJ files for Phaser game development.

## File Roles

### TSJ Files (Tileset Definition)
- Contains tile definitions, properties, and metadata
- Used for reference and tile property lookup
- Located in: `public/assets/shared/tilesets/tileset/[season]/[season].tsj`
- **Not loaded directly by Phaser** - for reference only

### TMJ Files (Map Data)
- Contains actual map data with embedded tileset
- Loaded directly by Phaser
- Located in: `public/assets/scenes/[mapname].tmj`
- Must embed tileset data for Phaser compatibility

## Key Indexing Difference

**Critical concept**: TSJ and TMJ use different indexing systems.

- **TSJ tiles**: 0-based indexing (tiles 0, 1, 2, 3...)
- **TMJ tiles**: 1-based indexing due to `firstgid: 1` offset
- **Conversion formula**: `TMJ tile ID = TSJ tile ID + 1`

## TMJ Structure for Embedded Tilesets

```json
{
  "tilesets": [{
    "columns": 9,
    "firstgid": 1,
    "image": "../shared/tilesets/tileset/spring/spring.png",
    "imageheight": 96,
    "imagewidth": 144,
    "margin": 0,
    "name": "spring",
    "spacing": 0,
    "tilecount": 54,
    "tileheight": 16,
    "tilewidth": 16
  }],
  "layers": [{
    "data": [1, 2, 3, ...], // Tile IDs in TMJ format (1-based)
    "height": 24,
    "name": "Ground",
    "type": "tilelayer",
    "width": 32
  }]
}
```

## Example: Spring Grass Map

### TSJ Reference (0-based)
- Tile 0: top-left corner
- Tile 1: top edge
- Tile 2: top-right corner
- Tile 9: left edge
- Tile 10: grass fill
- Tile 11: right edge
- Tile 18: bottom-left corner
- Tile 19: bottom edge
- Tile 20: bottom-right corner

### TMJ Implementation (1-based)
- Tile 1: top-left corner (TSJ 0 + 1)
- Tile 2: top edge (TSJ 1 + 1)
- Tile 3: top-right corner (TSJ 2 + 1)
- Tile 10: left edge (TSJ 9 + 1)
- Tile 11: grass fill (TSJ 10 + 1)
- Tile 12: right edge (TSJ 11 + 1)
- Tile 19: bottom-left corner (TSJ 18 + 1)
- Tile 20: bottom edge (TSJ 19 + 1)
- Tile 21: bottom-right corner (TSJ 20 + 1)

### Map Layout Pattern
```
[1,  2,  2,  2, ..., 2,  2,  3 ]  // Top row
[10, 11, 11, 11, ..., 11, 11, 12]  // Middle rows
[10, 11, 11, 11, ..., 11, 11, 12]
...
[19, 20, 20, 20, ..., 20, 20, 21]  // Bottom row
```

## Workflow Steps

1. **Reference TSJ**: Check tile IDs and properties in the `.tsj` file
2. **Convert IDs**: Add 1 to each TSJ tile ID for TMJ usage
3. **Embed tileset**: Include tileset data directly in TMJ (not external reference)
4. **Map layout**: Use converted tile IDs in the layer data array
5. **Test**: Verify map loads correctly in Phaser

## Important Notes

- **firstgid cannot be 0**: Tile ID 0 is reserved for "no tile" in TMJ format
- **Embedded vs External**: Phaser requires embedded tilesets, not external `.tsj` references
- **Property lookup**: Use TSJ files to understand tile properties and behavior
- **Asset paths**: Image paths in embedded tilesets are relative to the TMJ file location

## File Structure

```
public/assets/
├── scenes/
│   └── town.tmj              # Map with embedded tileset
└── shared/
    └── tilesets/
        └── tileset/
            └── spring/
                ├── spring.png    # Tileset image
                └── spring.tsj    # Tile definitions (reference only)
```

This workflow enables you to leverage detailed tile definitions from TSJ files while maintaining full Phaser compatibility through embedded TMJ tilesets.