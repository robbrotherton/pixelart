# 🎨 Simple Pixel Art Maker

A lightweight, browser-based pixel art creation tool that generates QR codes for easy sharing of your 16x16 pixel art creations.

## Features

- **16x16 Pixel Canvas**: Perfect size for creating simple pixel art
- **Color Picker**: Choose any color using the HTML5 color picker
- **Quick Palette**: Pre-selected common colors for fast access
- **Clear Canvas**: Reset your artwork with one click
- **QR Code Export**: Generate a QR code that contains your pixel art as a PNG image
- **Mobile Friendly**: Touch-enabled drawing for mobile devices
- **No Backend Required**: Runs entirely in the browser as a static website

## How It Works

1. **Draw**: Click or drag on the 16x16 grid to paint pixels
2. **Choose Colors**: Use the color picker or click palette colors
3. **Export**: Click "Export as QR Code" to generate a QR code
4. **Share**: Scan the QR code with any device to view your pixel art

## QR Code Functionality

The QR code contains a PNG data URL of your pixel art. When scanned:
- Opens directly in any web browser
- Displays your 16x16 pixel art as a crisp image
- No internet connection required to view (data is embedded in the QR code)
- Perfect for sharing on social media or with friends

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript
- **QR Generation**: Uses qrcode.js library via CDN
- **Image Format**: PNG data URLs for maximum compatibility
- **Hosting**: Designed for GitHub Pages static hosting

## File Structure

```
pixelart/
├── index.html      # Main application interface
├── style.css       # Styling and responsive design
├── script.js       # Core functionality and QR generation
└── README.md       # This file
```

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas API
- CSS Grid
- ES6 Classes
- Touch Events (for mobile)

## Setup for GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings > Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)"
5. Your pixel art maker will be available at `https://[username].github.io/[repository-name]`

## License

Free to use and modify. Perfect for learning web development or as a base for more complex pixel art tools.

---

**Created with ❤️ for pixel art enthusiasts**
