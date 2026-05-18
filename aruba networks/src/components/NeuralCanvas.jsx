import { useEffect, useRef } from 'react';
import './NeuralCanvas.css';

/* ── Neural network canvas animation ──────────────────
   Draws animated nodes and connecting edges that mimic
   a neural network topology. Runs on requestAnimationFrame.
   ─────────────────────────────────────────────────── */
const NODE_COUNT = 55;
const MAX_DIST   = 160;

export default function NeuralCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let rafId;

    /** Resize canvas to fill the viewport */
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    /** Create nodes with random positions and velocities */
    function createNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r:  Math.random() * 2 + 1.2,
      }));
    }

    /** Main animation frame */
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move nodes + bounce off edges
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Draw edges between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.22;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 107, 0, ${alpha})`;
            ctx.lineWidth   = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 130, 40, 0.55)';
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    }

    resize();
    createNodes();
    draw();

    const handleResize = () => { resize(); createNodes(); };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Canvas background */}
      <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />

      {/* Floating gradient orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
    </>
  );
}
