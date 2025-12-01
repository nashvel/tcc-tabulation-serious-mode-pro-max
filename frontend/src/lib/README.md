# Color Palette Library

A reusable color management system with localStorage persistence for React applications.

## Files

### `colorPalette.js`
Core color management library with utility functions.

### `../components/common/ColorPaletteMenu.jsx`
Reusable context menu component with color palette.

## Quick Start

### 1. Import the library in your component

```javascript
import {
  THEME_COLORS,
  loadCandidateColors,
  saveCandidateColors,
  applyNumberColor,
  applyNameColor,
  applyGenderRowColor,
  getCandidateNumberColor,
  getCandidateNameBgColor,
  getGenderRowBgColor
} from '../../lib/colorPalette';
```

### 2. Initialize state with localStorage

```javascript
const [candidateColors, setCandidateColors] = useState(() => loadCandidateColors());
```

### 3. Auto-save to localStorage

```javascript
useEffect(() => {
  saveCandidateColors(candidateColors);
}, [candidateColors]);
```

### 4. Use the ColorPaletteMenu component

```javascript
<ColorPaletteMenu
  visible={contextMenu.visible}
  x={contextMenu.x}
  y={contextMenu.y}
  colorScrollIndex={colorScrollIndex}
  onColorScrollChange={setColorScrollIndex}
  onColorSelect={(color) => {
    setCandidateColors(prev => applyNumberColor(prev, candidateId, color));
  }}
  onClose={closeContextMenu}
  menuItems={[
    {
      label: 'Edit',
      icon: <Edit3 size={16} />,
      onClick: handleEdit,
      hasBorder: true
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: handleDelete,
      isDanger: true
    }
  ]}
/>
```

## API Reference

### Color Functions

#### `loadCandidateColors()`
Loads colors from localStorage.
```javascript
const colors = loadCandidateColors();
```

#### `saveCandidateColors(colors)`
Saves colors to localStorage.
```javascript
saveCandidateColors(candidateColors);
```

#### `clearCandidateColors()`
Clears all colors from localStorage.
```javascript
clearCandidateColors();
```

### Apply Color Functions

#### `applyNumberColor(colors, candidateId, color)`
Apply color to a candidate number.
```javascript
const updated = applyNumberColor(colors, 1, THEME_COLORS[2]);
```

#### `applyNameColor(colors, candidateId, color)`
Apply color to a candidate name background.
```javascript
const updated = applyNameColor(colors, 1, THEME_COLORS[2]);
```

#### `applyGenderRowColor(colors, gender, color)`
Apply color to all rows with the same gender.
```javascript
const updated = applyGenderRowColor(colors, 'Male', THEME_COLORS[2]);
```

### Get Color Functions

#### `getCandidateNumberColor(colors, candidateId, fallbackColor)`
Get color for a candidate number.
```javascript
const color = getCandidateNumberColor(colors, 1, '#000000');
```

#### `getCandidateNameBgColor(colors, candidateId)`
Get background color for a candidate name.
```javascript
const bgColor = getCandidateNameBgColor(colors, 1);
```

#### `getGenderRowBgColor(colors, gender)`
Get row background color for a gender.
```javascript
const bgColor = getGenderRowBgColor(colors, 'Male');
```

### Export/Import Functions

#### `exportColorsToFile(colors, filename)`
Export colors to a JSON file.
```javascript
exportColorsToFile(candidateColors, 'my-colors.json');
```

#### `importColorsFromFile(file)`
Import colors from a JSON file.
```javascript
const colors = await importColorsFromFile(fileInput.files[0]);
```

## Theme Colors

The library includes 11 predefined colors:

```javascript
THEME_COLORS = [
  { name: 'Default', value: 'default', primary: '#FFFFFF', ... },
  { name: 'Indigo', value: 'indigo', primary: '#4F46E5', ... },
  { name: 'Blue', value: 'blue', primary: '#3B82F6', ... },
  { name: 'Purple', value: 'purple', primary: '#9333EA', ... },
  { name: 'Pink', value: 'pink', primary: '#EC4899', ... },
  { name: 'Red', value: 'red', primary: '#EF4444', ... },
  { name: 'Orange', value: 'orange', primary: '#F97316', ... },
  { name: 'Amber', value: 'amber', primary: '#F59E0B', ... },
  { name: 'Green', value: 'green', primary: '#10B981', ... },
  { name: 'Teal', value: 'teal', primary: '#14B8A6', ... },
  { name: 'Cyan', value: 'cyan', primary: '#06B6D4', ... },
]
```

## localStorage Structure

Colors are stored in localStorage under the key `candidateColors`:

```json
{
  "1-number": "#4F46E5",
  "1-name-bg": "#3B82F6",
  "gender-Male-row-bg": "#10B981",
  "gender-Female-row-bg": "#EC4899"
}
```

## Example: Using in Another Component

```javascript
import { useState, useEffect } from 'react';
import {
  loadCandidateColors,
  saveCandidateColors,
  getCandidateNumberColor
} from '../../lib/colorPalette';

export default function MyComponent() {
  const [colors, setColors] = useState(() => loadCandidateColors());

  useEffect(() => {
    saveCandidateColors(colors);
  }, [colors]);

  return (
    <div style={{ color: getCandidateNumberColor(colors, 1) }}>
      Candidate #1
    </div>
  );
}
```

## Features

✅ localStorage persistence
✅ Reusable color management functions
✅ Circular color palette UI
✅ Scroll navigation with arrows
✅ Export/import colors to JSON
✅ 11 predefined theme colors
✅ Type-safe color application
✅ Easy integration with any component

## License

MIT
