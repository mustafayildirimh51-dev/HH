document.documentElement.classList.add("js");
if (new URLSearchParams(window.location.search).get("view") === "atelier") {
  document.documentElement.classList.add("view-atelier");
}

const products = {
  saray: {
    category: "El dokuması",
    title: "Saray Dokusu",
    image: "assets/product-handwoven.png",
    description:
      "İpek ışıltısı ve yün sıcaklığını dengeli taşıyan, salon ve temsil alanları için prestijli bir parça.",
    specs: ["El dokuması", "Yün & ipek", "240 x 340 cm"],
  },
  nova: {
    category: "Modern",
    title: "Nova Geometri",
    image: "assets/product-modern.png",
    description:
      "Çağdaş çizgiler, yüksek-alçak hav dokusu ve sakin renk dengesiyle modern yaşam alanlarına güçlü bir odak verir.",
    specs: ["Makine destekli özel dokuma", "Yün & viskon", "200 x 300 cm"],
  },
  miras: {
    category: "Klasik",
    title: "Miras Kilim",
    image: "assets/product-classic.png",
    description:
      "Klasik motifleri ince flatweave yapı ile birleştiren, zamansız ve dayanıklı bir kilim karakteri.",
    specs: ["Flatweave kilim", "Yün", "180 x 280 cm"],
  },
};

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const drawer = document.querySelector(".product-drawer");
const drawerBackdrop = document.querySelector(".drawer-backdrop");

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 18);
  document.documentElement.style.setProperty("--hero-shift", `${Math.min(y * 0.18, 110)}px`);
});

navToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 },
);

document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
setTimeout(() => {
  document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("visible"));
}, 900);

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".product-card").forEach((card) => {
      const visible = filter === "all" || card.dataset.category === filter;
      card.toggleAttribute("hidden", !visible);
    });
  });
});

document.querySelectorAll(".product-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--y", `${event.clientY - rect.top}px`);
  });

  card.addEventListener("click", () => openProduct(card.dataset.product));
});

document.querySelectorAll("[data-product-open]").forEach((button) => {
  button.addEventListener("click", () => openProduct(button.dataset.productOpen));
});

function openProduct(key = "saray") {
  const product = products[key] ?? products.saray;
  drawer.querySelector(".drawer-image").src = product.image;
  drawer.querySelector(".drawer-image").alt = product.title;
  drawer.querySelector(".drawer-category").textContent = product.category;
  drawer.querySelector("#drawerTitle").textContent = product.title;
  drawer.querySelector(".drawer-description").textContent = product.description;

  const values = drawer.querySelectorAll("dd");
  product.specs.forEach((spec, index) => {
    values[index].textContent = spec;
  });

  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  drawerBackdrop.hidden = false;
  document.body.classList.add("drawer-open");
}

function closeProduct() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  drawerBackdrop.hidden = true;
  document.body.classList.remove("drawer-open");
}

drawer.querySelector(".drawer-close").addEventListener("click", closeProduct);
drawerBackdrop.addEventListener("click", closeProduct);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProduct();
});

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = encodeURIComponent(form.name.value.trim());
  const contact = encodeURIComponent(form.contact.value.trim());
  const message = encodeURIComponent(form.message.value.trim());
  window.location.href = `mailto:haciosmanlarhali@gmail.com?subject=Web%20Sitesi%20Iletisim&body=Ad:%20${name}%0AIletisim:%20${contact}%0A%0AMesaj:%20${message}`;
});

initRugViewer();

async function initRugViewer() {
  try {
    const THREE = await import("https://unpkg.com/three@0.162.0/build/three.module.js");
    initThreeRugViewer(THREE);
  } catch {
    initCanvasRugViewer();
  }
}

function initThreeRugViewer(THREE) {
  const canvas = document.querySelector("#rugViewer");
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 3.5, 7.2);

  const group = new THREE.Group();
  group.rotation.x = -0.72;
  scene.add(group);

  const texture = new THREE.CanvasTexture(createRugPatternCanvas());
  texture.anisotropy = 8;

  const geometry = new THREE.PlaneGeometry(5.1, 7.2, 120, 120);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.78,
    metalness: 0.02,
    bumpMap: texture,
    bumpScale: 0.055,
    side: THREE.DoubleSide,
  });
  const rug = new THREE.Mesh(geometry, material);
  group.add(rug);

  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(5.18, 7.28, 0.055),
    new THREE.MeshStandardMaterial({ color: 0x1b1713, roughness: 0.7 }),
  );
  edge.position.z = -0.045;
  group.add(edge);

  const ambient = new THREE.HemisphereLight(0xf4ead8, 0x171512, 1.15);
  const key = new THREE.DirectionalLight(0xffd38b, 2.6);
  key.position.set(3.4, 5, 4);
  const rim = new THREE.DirectionalLight(0x7fb7b8, 1.2);
  rim.position.set(-4, 2.5, -3);
  scene.add(ambient, key, rim);

  let dragging = false;
  let lastX = 0;
  let targetRotation = 0;

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    targetRotation += (event.clientX - lastX) * 0.012;
    lastX = event.clientX;
  });

  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  function animate(time) {
    group.rotation.z += (targetRotation - group.rotation.z) * 0.08;
    if (!dragging) targetRotation += 0.0025;
    rug.position.z = Math.sin(time * 0.0016) * 0.025;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  animate(0);
}

function initCanvasRugViewer() {
  const canvas = document.querySelector("#rugViewer");
  const ctx = canvas.getContext("2d");
  const pattern = createRugPatternCanvas();
  let dragging = false;
  let lastX = 0;
  let rotation = 0;
  let targetRotation = 0;

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    targetRotation += (event.clientX - lastX) * 0.01;
    lastX = event.clientX;
  });

  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * Math.min(devicePixelRatio, 2)));
    canvas.height = Math.max(1, Math.floor(rect.height * Math.min(devicePixelRatio, 2)));
    ctx.setTransform(canvas.width / rect.width, 0, 0, canvas.height / rect.height, 0, 0);
  }

  function draw(time) {
    const rect = canvas.getBoundingClientRect();
    rotation += (targetRotation - rotation) * 0.08;
    if (!dragging) targetRotation += 0.003;

    ctx.clearRect(0, 0, rect.width, rect.height);
    const glow = ctx.createRadialGradient(rect.width * 0.52, rect.height * 0.34, 20, rect.width * 0.52, rect.height * 0.34, rect.width * 0.5);
    glow.addColorStop(0, "rgba(201,163,91,0.22)");
    glow.addColorStop(1, "rgba(201,163,91,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, rect.width, rect.height);

    const scale = Math.min(rect.width / 680, rect.height / 620);
    const width = 430 * scale;
    const height = 610 * scale;
    const cx = rect.width / 2;
    const cy = rect.height / 2 + 22 * scale + Math.sin(time * 0.002) * 4;
    const skew = Math.sin(rotation) * width * 0.28;
    const tilt = 0.42 + Math.cos(rotation) * 0.08;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - width / 2 + skew, cy - height * tilt / 2);
    ctx.lineTo(cx + width / 2 + skew, cy - height * tilt / 2);
    ctx.lineTo(cx + width / 2 - skew, cy + height * tilt / 2);
    ctx.lineTo(cx - width / 2 - skew, cy + height * tilt / 2);
    ctx.closePath();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 24;
    ctx.clip();

    ctx.setTransform(
      canvas.width / rect.width,
      Math.sin(rotation) * 0.05,
      -Math.sin(rotation) * 0.22,
      (canvas.height / rect.height) * tilt,
      0,
      0,
    );
    ctx.drawImage(pattern, (cx - width / 2) / (canvas.width / rect.width), (cy - height / 2) / ((canvas.height / rect.height) * tilt), width / (canvas.width / rect.width), height / ((canvas.height / rect.height) * tilt));
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = "rgba(244,234,216,0.18)";
    ctx.lineWidth = 1;
    for (let i = -7; i <= 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(cx - width / 2 + i * 26 * scale + skew, cy - height * tilt / 2);
      ctx.lineTo(cx - width / 2 + i * 26 * scale - skew, cy + height * tilt / 2);
      ctx.stroke();
    }
    ctx.restore();

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw(0);
}

function createRugPatternCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#1a1713");
  gradient.addColorStop(0.48, "#6e2930");
  gradient.addColorStop(1, "#132d31");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBorder(ctx, 54, "#c9a35b", 8);
  drawBorder(ctx, 92, "#f4ead8", 3);
  drawBorder(ctx, 126, "#8f4c3a", 14);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  for (let i = 0; i < 4; i += 1) {
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = i % 2 === 0 ? "rgba(244, 234, 216, 0.82)" : "rgba(201, 163, 91, 0.78)";
    diamond(ctx, 0, -210, 210, 300);
    ctx.fillStyle = "rgba(13, 12, 10, 0.72)";
    diamond(ctx, 0, -210, 112, 154);
  }
  ctx.restore();

  for (let y = 180; y < canvas.height - 160; y += 135) {
    for (let x = 150; x < canvas.width - 120; x += 155) {
      ctx.fillStyle = (x + y) % 2 ? "rgba(244, 234, 216, 0.28)" : "rgba(201, 163, 91, 0.3)";
      diamond(ctx, x, y, 36, 58);
    }
  }

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < image.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 24;
    image.data[i] += noise;
    image.data[i + 1] += noise;
    image.data[i + 2] += noise;
  }
  ctx.putImageData(image, 0, 0);

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#f4ead8";
  ctx.lineWidth = 1;
  for (let y = 0; y < canvas.height; y += 7) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y + Math.sin(y * 0.05) * 3);
    ctx.stroke();
  }

  return canvas;
}

function drawBorder(ctx, inset, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.strokeRect(inset, inset, ctx.canvas.width - inset * 2, ctx.canvas.height - inset * 2);
}

function diamond(ctx, x, y, width, height) {
  ctx.beginPath();
  ctx.moveTo(x, y - height / 2);
  ctx.lineTo(x + width / 2, y);
  ctx.lineTo(x, y + height / 2);
  ctx.lineTo(x - width / 2, y);
  ctx.closePath();
  ctx.fill();
}
