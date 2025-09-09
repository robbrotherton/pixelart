class PixelArtMaker {
    constructor() {
        this.gridSize = 16;
        this.pixelData = Array(this.gridSize * this.gridSize).fill('transparent');
        this.currentColor = '#000000';
        this.isDrawing = false;
        this.drawingStarted = false;
        
        // History system for undo functionality
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50; // Limit history to prevent memory issues
        
        this.init();
    }

    init() {
        this.createPixelGrid();
        this.setupEventListeners();
        this.updateCurrentColorDisplay();
        this.saveToHistory(); // Save initial empty state
        this.loadFromURL(); // Load pixel art from URL if available
    }

    createPixelGrid() {
        const canvas = document.getElementById('pixelCanvas');
        canvas.innerHTML = ''; // Clear existing content
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel transparent';
            pixel.dataset.index = i;
            canvas.appendChild(pixel);
        }
    }

    setupEventListeners() {
        // Current color indicator opens modal
        const currentColorEl = document.getElementById('currentColor');
        currentColorEl.addEventListener('click', () => {
            this.openColorModal();
        });

        // Modal functionality
        const modal = document.getElementById('colorModal');
        const closeModal = document.getElementById('closeModal');
        
        closeModal.addEventListener('click', () => {
            this.closeColorModal();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeColorModal();
            }
        });

        // Preset color options
        document.querySelectorAll('.color-option').forEach(colorOption => {
            colorOption.addEventListener('click', (e) => {
                this.selectColor(e.target.dataset.color);
                this.closeColorModal();
            });
        });

        // Pixel canvas interactions
        const canvas = document.getElementById('pixelCanvas');
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('pixel')) {
                this.isDrawing = true;
                this.drawingStarted = true; // Flag to save history at end
                this.paintPixel(e.target);
            }
        });

        canvas.addEventListener('mouseover', (e) => {
            if (this.isDrawing && e.target.classList.contains('pixel')) {
                this.paintPixel(e.target);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDrawing && this.drawingStarted) {
                this.saveToHistory(); // Save state after drawing session
                this.drawingStarted = false;
                this.hideQRContainer(); // Hide QR after drawing session ends
            }
            this.isDrawing = false;
        });

        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element && element.classList.contains('pixel')) {
                this.isDrawing = true;
                this.drawingStarted = true; // Flag to save history at end
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
            if (this.isDrawing && this.drawingStarted) {
                this.saveToHistory(); // Save state after drawing session
                this.drawingStarted = false;
                this.hideQRContainer(); // Hide QR after drawing session ends
            }
            this.isDrawing = false;
        });

        // Control buttons
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.clearCanvas();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportAsQR();
        });
    }

    paintPixel(pixelElement) {
        const index = parseInt(pixelElement.dataset.index);
        this.pixelData[index] = this.currentColor;
        
        if (this.currentColor === 'transparent') {
            pixelElement.style.backgroundColor = 'transparent';
            pixelElement.classList.add('transparent');
        } else {
            pixelElement.style.backgroundColor = this.currentColor;
            pixelElement.classList.remove('transparent');
        }
    }

    hideQRContainer() {
        const qrContainer = document.getElementById('qrContainer');
        if (qrContainer) {
            qrContainer.classList.remove('visible');
        }
    }

    updateCurrentColorDisplay() {
        const currentColorEl = document.getElementById('currentColor');
        if (this.currentColor === 'transparent') {
            currentColorEl.style.backgroundColor = 'transparent';
            currentColorEl.className = 'current-color transparent-swatch';
        } else {
            currentColorEl.style.backgroundColor = this.currentColor;
            currentColorEl.className = 'current-color';
        }
    }

    selectColor(color) {
        this.currentColor = color;
        this.updateCurrentColorDisplay();
        this.updateModalSelection();
    }

    updateModalSelection() {
        document.querySelectorAll('.color-option').forEach(colorOption => {
            colorOption.classList.remove('selected');
            if (colorOption.dataset.color === this.currentColor) {
                colorOption.classList.add('selected');
            }
        });
    }

    openColorModal() {
        const modal = document.getElementById('colorModal');
        modal.classList.add('active');
        this.updateModalSelection();
    }

    closeColorModal() {
        const modal = document.getElementById('colorModal');
        modal.classList.remove('active');
    }

    clearCanvas() {
        this.pixelData.fill('transparent');
        document.querySelectorAll('.pixel').forEach(pixel => {
            pixel.style.backgroundColor = 'transparent';
            pixel.classList.add('transparent');
        });
        this.saveToHistory(); // Save state after clearing
        this.hideQRContainer();
    }

    // History management methods
    saveToHistory() {
        // Remove any history after current index (when undoing then making new changes)
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add current state to history
        this.history.push([...this.pixelData]);
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        // Update undo button state
        this.updateUndoButton();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.pixelData = [...this.history[this.historyIndex]];
            this.restoreCanvasFromData();
            this.updateUndoButton();
            this.hideQRContainer();
        }
    }

    restoreCanvasFromData() {
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach((pixel, index) => {
            const color = this.pixelData[index];
            if (color === 'transparent') {
                pixel.style.backgroundColor = 'transparent';
                pixel.classList.add('transparent');
            } else {
                pixel.style.backgroundColor = color;
                pixel.classList.remove('transparent');
            }
        });
    }

    updateUndoButton() {
        const undoBtn = document.getElementById('undoBtn');
        undoBtn.disabled = this.historyIndex <= 0;
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
            
            // Clear canvas with transparent background
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw each pixel
            for (let i = 0; i < this.pixelData.length; i++) {
                const x = i % this.gridSize;
                const y = Math.floor(i / this.gridSize);
                
                // Only draw non-transparent pixels
                if (this.pixelData[i] !== 'transparent') {
                    ctx.fillStyle = this.pixelData[i];
                    ctx.fillRect(x, y, 1, 1);
                }
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
            qrContainer.classList.add('visible');
            
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
        
        // Create color palette string
        const palette = Array.from(colorMap.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([color]) => {
                // Handle transparent separately from hex colors
                if (color === 'transparent') {
                    return 'transparent';
                } else {
                    // Remove # from hex colors
                    return color.substring(1);
                }
            })
            .join('|');
        
        return `${palette}||${encoded}`;
    }

    loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        
        if (!data) return;

        try {
            // Parse the compact format: palette||encoded
            const parts = data.split('||');
            if (parts.length !== 2) {
                console.error('Invalid data format in URL');
                return;
            }
            
            const [paletteStr, encoded] = parts;
            
            // Rebuild color palette
            const colors = [];
            const paletteColors = paletteStr.split('|');
            
            for (const colorStr of paletteColors) {
                if (colorStr === 'transparent') {
                    colors.push('transparent');
                } else if (colorStr.length === 6) {
                    colors.push('#' + colorStr);
                }
            }

            // Decode pixel data
            const pixelData = [];
            for (let i = 0; i < encoded.length; i++) {
                const colorIndex = parseInt(encoded[i], 36);
                pixelData.push(colors[colorIndex] || 'transparent');
            }

            // Pad to 256 pixels if needed
            while (pixelData.length < 256) {
                pixelData.push('transparent');
            }

            // Load the pixel data into the editor
            this.pixelData = pixelData;
            
            // Update the visual grid
            const pixels = document.querySelectorAll('.pixel');
            pixels.forEach((pixel, index) => {
                const color = this.pixelData[index];
                if (color === 'transparent') {
                    pixel.style.backgroundColor = 'transparent';
                    pixel.classList.add('transparent');
                } else {
                    pixel.style.backgroundColor = color;
                    pixel.classList.remove('transparent');
                }
            });

            console.log('Loaded pixel art from URL');
            
            // Save the loaded state to history (but replace the initial empty state)
            this.history[0] = [...this.pixelData];
            this.updateUndoButton();
            
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
