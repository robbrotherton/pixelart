// Simple QR Code Generator Alternative
// This is a minimal implementation for our pixel art use case

class SimpleQRGenerator {
    static generateQRCodeSVG(text, size = 200) {
        // For a simple implementation, we'll create a QR-like visual representation
        // This won't be a real QR code but will serve as a placeholder
        // In production, you'd want to use a proper QR library
        
        const gridSize = 21; // Typical QR code size
        const cellSize = size / gridSize;
        
        // Create a simple pattern based on the text hash
        const hash = this.simpleHash(text);
        const pattern = this.generatePattern(hash, gridSize);
        
        let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
        svg += `<rect width="${size}" height="${size}" fill="white"/>`;
        
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (pattern[y * gridSize + x]) {
                    const rectX = x * cellSize;
                    const rectY = y * cellSize;
                    svg += `<rect x="${rectX}" y="${rectY}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
                }
            }
        }
        
        svg += '</svg>';
        return svg;
    }
    
    static simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    
    static generatePattern(hash, size) {
        const pattern = new Array(size * size).fill(false);
        
        // Add corner squares (finder patterns)
        this.addFinderPattern(pattern, size, 0, 0);
        this.addFinderPattern(pattern, size, size - 7, 0);
        this.addFinderPattern(pattern, size, 0, size - 7);
        
        // Add some data pattern based on hash
        for (let i = 0; i < size * size; i++) {
            if (!pattern[i]) { // Don't overwrite finder patterns
                pattern[i] = ((hash + i) % 3) === 0;
            }
        }
        
        return pattern;
    }
    
    static addFinderPattern(pattern, size, startX, startY) {
        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 7; x++) {
                const px = startX + x;
                const py = startY + y;
                if (px < size && py < size) {
                    // Create the 7x7 finder pattern
                    if (x === 0 || x === 6 || y === 0 || y === 6 || 
                        (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
                        pattern[py * size + px] = true;
                    }
                }
            }
        }
    }
}
