import { useEffect, useRef } from 'react';

// A reduced-density implementation of the supplied Atmospheric Friction reference.
// It scales the particle count by screen size so the workspace stays responsive.
export function AsmrStaticBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const mouse = { x: -1000, y: -1000 };
    let frameId;
    let width = 0;
    let height = 0;
    let particles = [];

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const particleCount = Math.max(170, Math.min(420, Math.round((width * height) / 5000)));
      particles = Array.from({ length: particleCount }, () => createParticle(width, height));
    };

    const draw = () => {
      context.fillStyle = 'rgba(6, 7, 9, 0.16)';
      context.fillRect(0, 0, width, height);

      particles.forEach((particle) => {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.hypot(dx, dy) || 1;
        const radius = 245;
        const force = Math.max(0, (radius - distance) / radius);

        if (force) {
          particle.vx += ((dx / distance) * force * 0.11) + ((dy / distance) * force * 0.38);
          particle.vy += ((dy / distance) * force * 0.11) - ((dx / distance) * force * 0.38);
          particle.glow = Math.min(0.75, particle.glow + force * 0.16);
        } else {
          particle.glow *= 0.91;
        }

        particle.vx = particle.vx * 0.95 + (Math.random() - 0.5) * 0.025;
        particle.vy = particle.vy * 0.95 + (Math.random() - 0.5) * 0.025;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed + (Math.abs(particle.vx) + Math.abs(particle.vy)) * 0.04;

        if (particle.x < -16) particle.x = width + 16;
        if (particle.x > width + 16) particle.x = -16;
        if (particle.y < -16) particle.y = height + 16;
        if (particle.y > height + 16) particle.y = -16;

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = `rgba(${particle.color}, ${Math.min(particle.alpha + particle.glow, 0.82)})`;
        if (particle.glow > 0.16) {
          context.shadowBlur = 12 * particle.glow;
          context.shadowColor = `rgba(190, 220, 255, ${particle.glow})`;
        }
        context.beginPath();
        context.moveTo(0, -particle.size * 2.5);
        context.lineTo(particle.size, 0);
        context.lineTo(0, particle.size * 2.5);
        context.lineTo(-particle.size, 0);
        context.closePath();
        context.fill();
        context.restore();
      });

      frameId = window.requestAnimationFrame(draw);
    };

    const moveMouse = (event) => {
      const point = event.touches?.[0] ?? event;
      mouse.x = point.clientX;
      mouse.y = point.clientY;
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', moveMouse, { passive: true });
    window.addEventListener('touchmove', moveMouse, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('touchmove', moveMouse);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#060709]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(173,191,216,0.07),transparent_25%),radial-gradient(ellipse_at_0%_70%,rgba(113,113,124,0.06),transparent_28%),linear-gradient(to_bottom,rgba(6,7,9,0.08),rgba(6,7,9,0.78))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
    </div>
  );
}

function createParticle(width, height) {
  const isGlass = Math.random() > 0.7;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    size: Math.random() * 1.35 + 0.45,
    alpha: Math.random() * 0.28 + 0.06,
    color: isGlass ? '220, 228, 240' : '91, 94, 102',
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.045,
    glow: 0,
  };
}
