// Simple TreeViz: draws a number of trees proportional to cumulative kgCO2e
// Lower emissions -> more healthy trees (green); higher -> fewer / brown trees

class TreeViz {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.cumulativeKg = 0;
  }

  // Resize canvas to match CSS size and devicePixelRatio for crisp rendering
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(100, Math.floor(rect.width));
    const h = Math.max(80, Math.floor(rect.height || (rect.width * 0.6)));
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
    this.width = w;
    this.height = h;
  }

  setCumulativeKg(kg) {
    this.cumulativeKg = kg;
    this.draw();
  }

  clear() { this.ctx.clearRect(0,0,this.width,this.height); }

  draw() {
    this.clear();
    // Map cumulative kg to tree count 0..10 (lower kg => more trees)
    const maxKg = 50; // tuning parameter
    const score = Math.max(0, Math.min(1, 1 - (this.cumulativeKg / maxKg)));
    const treeCount = Math.round(2 + score * 8);

    // Draw ground
    this.ctx.fillStyle = '#dff0d9';
    this.ctx.fillRect(0, this.height - 40, this.width, 40);

    // Draw trees evenly
    for (let i = 0; i < treeCount; i++) {
      const x = (i + 0.5) * (this.width / treeCount);
      this.drawTree(x, this.height - 40);
    }

    // Draw label
    this.ctx.fillStyle = '#26421a';
    const fontSize = Math.max(12, Math.round(14 * (this.width / 400)));
    this.ctx.font = `${fontSize}px sans-serif`;
    this.ctx.fillText(`累计排放: ${this.cumulativeKg.toFixed(2)} kgCO2e`, 10, Math.max(18, fontSize + 4));
  }

  drawTree(x, groundY) {
    const trunkH = 30;
    const crownR = 22;
    // trunk
    this.ctx.fillStyle = '#6b4a2a';
    this.ctx.fillRect(x-4, groundY - trunkH, 8, trunkH);
    // crown (color depends on cumulative)
    const healthy = Math.max(0, Math.min(1, 1 - (this.cumulativeKg / 50)));
    const g = Math.round(120 + healthy * 80);
    const color = `rgb(34,${g},34)`;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, groundY - trunkH - 6, crownR, 0, Math.PI*2);
    this.ctx.fill();
  }
}

if (typeof module !== 'undefined') module.exports = TreeViz;
