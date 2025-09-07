class PixelArtMaker {
    constructor() {
        this.gridSize = 16;
        this.pixelData = Array(this.gridSize * this.gridSize).fill('#ffffff');
        this.currentColor = '#000000';
        this.isDrawing = false;
        
        this.init();
    }

    init() {
        this.createPixelGrid();
        this.setupEventListeners();
        this.updateCurrentColorDisplay();
        this.loadFromURL(); // Load pixel art from URL if available
    }

    createPixelGrid() {
        const canvas = document.getElementById('pixelCanvas');
        canvas.innerHTML = ''; // Clear existing content
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.dataset.index = i;
            canvas.appendChild(pixel);
        }
    }

    setupEventListeners() {
        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('change', (e) => {
            this.currentColor = e.target.value;
            this.updateCurrentColorDisplay();
            this.updatePaletteSelection();
        });

        // Palette colors
        document.querySelectorAll('.palette-color').forEach(paletteColor => {
            paletteColor.addEventListener('click', (e) => {
                this.currentColor = e.target.dataset.color;
                colorPicker.value = this.currentColor;
                this.updateCurrentColorDisplay();
                this.updatePaletteSelection();
            });
        });

        // Pixel canvas interactions
        const canvas = document.getElementById('pixelCanvas');
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('pixel')) {
                this.isDrawing = true;
                this.paintPixel(e.target);
            }
        });

        canvas.addEventListener('mouseover', (e) => {
            if (this.isDrawing && e.target.classList.contains('pixel')) {
                this.paintPixel(e.target);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });

        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element && element.classList.contains('pixel')) {
                this.isDrawing = true;
                this.paintPixel(element);
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element && element.classList.contains('pixel')) {
                    this.paintPixel(element);
                }
            }
        });

        document.addEventListener('touchend', () => {
            this.isDrawing = false;
        });

        // Control buttons
        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.clearCanvas();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportAsQR();
        });

        // Test QR button for debugging
        document.getElementById('testQR').addEventListener('click', () => {
            this.testQR();
        });
    }

    paintPixel(pixelElement) {
        const index = parseInt(pixelElement.dataset.index);
        this.pixelData[index] = this.currentColor;
        pixelElement.style.backgroundColor = this.currentColor;
    }

    updateCurrentColorDisplay() {
        document.getElementById('currentColor').style.backgroundColor = this.currentColor;
    }

    updatePaletteSelection() {
        document.querySelectorAll('.palette-color').forEach(paletteColor => {
            paletteColor.classList.remove('selected');
            if (paletteColor.dataset.color === this.currentColor) {
                paletteColor.classList.add('selected');
            }
        });
    }

    clearCanvas() {
        this.pixelData.fill('#ffffff');
        document.querySelectorAll('.pixel').forEach(pixel => {
            pixel.style.backgroundColor = '#ffffff';
        });
    }

    async exportAsQR() {
        try {
            console.log('Export function called');
            console.log('QRious available:', typeof QRious);
            
            // Check if QRious library is available
            if (typeof QRious === 'undefined') {
                alert('QR Code library not loaded properly. Please refresh the page.');
                return;
            }

            // Create a canvas element to generate the PNG
            const canvas = document.createElement('canvas');
            canvas.width = this.gridSize;
            canvas.height = this.gridSize;
            const ctx = canvas.getContext('2d');
            
            // Draw each pixel
            for (let i = 0; i < this.pixelData.length; i++) {
                const x = i % this.gridSize;
                const y = Math.floor(i / this.gridSize);
                
                ctx.fillStyle = this.pixelData[i];
                ctx.fillRect(x, y, 1, 1);
            }
            
            // Convert to PNG data URL
            const dataURL = canvas.toDataURL('image/png');
            console.log('Data URL length:', dataURL.length);
            
            // Create compact representation for shorter URLs
            const compactData = this.createCompactRepresentation();
            console.log('Compact data:', compactData);
            
            // Generate QR code with a link to the viewer page
            const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
            const viewerUrl = `${baseUrl}view.html?data=${encodeURIComponent(compactData)}`;
            console.log('Viewer URL:', viewerUrl);
            
            const qrContainer = document.getElementById('qrContainer');
            const qrCodeElement = document.getElementById('qrcode');
            
            // Clear previous QR code
            qrCodeElement.innerHTML = '';
            
            // Create a canvas for the QR code using QRious
            const qrCanvas = document.createElement('canvas');
            qrCodeElement.appendChild(qrCanvas);
            
            console.log('Creating QR code...');
            
            // Generate QR code with the viewer URL (much shorter than data URL)
            const qr = new QRious({
                element: qrCanvas,
                value: viewerUrl,
                size: 200,
                level: 'M' // Medium error correction since URL is shorter
            });
            
            console.log('QR code created successfully');
            
            // Update the instructions
            const instructions = qrContainer.querySelector('.qr-instructions');
            if (instructions) {
                instructions.textContent = 'Scan with your phone to open your pixel art in the browser';
            }
            
            // Also provide download option and show the URL
            const linkContainer = document.createElement('div');
            linkContainer.style.marginTop = '15px';
            linkContainer.innerHTML = `
                <p style="margin-bottom: 10px;"><strong>Alternative options:</strong></p>
                <a href="${dataURL}" download="pixel-art.png" style="display: inline-block; padding: 8px 16px; background: #4ecdc4; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">Download PNG</a>
                <a href="${viewerUrl}" target="_blank" style="display: inline-block; padding: 8px 16px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">Open Viewer</a>
                <div style="margin-top: 10px; font-size: 12px; color: #666; word-break: break-all;">
                    <strong>QR URL:</strong> ${viewerUrl}
                </div>
            `;
            qrCodeElement.appendChild(linkContainer);
            
            // Show the QR container
            qrContainer.style.display = 'block';
            
            // Scroll to QR code
            qrContainer.scrollIntoView({ behavior: 'smooth' });
            
            console.log('QR code export completed successfully');
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Error generating QR code: ' + error.message + '. You can still download the PNG directly.');
        }
    }

    createCompactRepresentation() {
        // Create a compact string representation of the pixel art
        // This encodes the colors more efficiently than a full data URL
        const colorMap = new Map();
        let colorIndex = 0;
        
        // Map unique colors to single characters
        const encoded = this.pixelData.map(color => {
            if (!colorMap.has(color)) {
                colorMap.set(color, colorIndex.toString(36));
                colorIndex++;
            }
            return colorMap.get(color);
        }).join('');
        
        // Create color palette string (remove # from hex colors)
        const palette = Array.from(colorMap.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([color]) => color.substring(1))
            .join('');
        
        return `${palette}|${encoded}`;
    }

    testQR() {
        try {
            console.log('Testing QR generation...');
            console.log('QRious available:', typeof QRious);
            
            if (typeof QRious === 'undefined') {
                alert('QRious not available!');
                return;
            }

            const qrContainer = document.getElementById('qrContainer');
            const qrCodeElement = document.getElementById('qrcode');
            
            qrCodeElement.innerHTML = '<h3>Test QR Code:</h3>';
            
            const testCanvas = document.createElement('canvas');
            qrCodeElement.appendChild(testCanvas);
            
            const qr = new QRious({
                element: testCanvas,
                value: 'https://www.google.com',
                size: 200
            });
            
            qrContainer.style.display = 'block';
            qrContainer.scrollIntoView({ behavior: 'smooth' });
            
            console.log('Test QR created successfully');
            
        } catch (error) {
            console.error('Test QR failed:', error);
            alert('Test QR failed: ' + error.message);
        }
    }

    loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        
        if (!data) return;

        try {
            // Parse the compact format: palette|encoded
            const [palette, encoded] = data.split('|');
            
            if (!palette || !encoded) {
                console.error('Invalid data format in URL');
                return;
            }

            // Rebuild color palette
            const colors = [];
            for (let i = 0; i < palette.length; i += 6) {
                colors.push('#' + palette.substr(i, 6));
            }

            // Decode pixel data
            const pixelData = [];
            for (let i = 0; i < encoded.length; i++) {
                const colorIndex = parseInt(encoded[i], 36);
                pixelData.push(colors[colorIndex] || '#ffffff');
            }

            // Pad to 256 pixels if needed
            while (pixelData.length < 256) {
                pixelData.push('#ffffff');
            }

            // Load the pixel data into the editor
            this.pixelData = pixelData;
            
            // Update the visual grid
            const pixels = document.querySelectorAll('.pixel');
            pixels.forEach((pixel, index) => {
                pixel.style.backgroundColor = this.pixelData[index];
            });

            console.log('Loaded pixel art from URL');
            
            // Clear the URL parameter so it doesn't interfere with future exports
            if (window.history && window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            
        } catch (error) {
            console.error('Error loading pixel art from URL:', error);
        }
    }

    // Utility method to convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

// Initialize the pixel art maker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PixelArtMaker();
});
