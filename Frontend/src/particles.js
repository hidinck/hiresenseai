export function startParticles() {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const dots = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - .5) * .6,
    vy: (Math.random() - .5) * .6,
    r: Math.random() * 2 + 1
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.fillStyle = "#00ffff88";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
