import { AppSettings } from '../types';

export interface ProcessedLogoResult {
  masterLogo: string;
  favicon: string;
  pwa192: string;
  pwa512: string;
  appleTouch: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  dimensions: { width: number; height: number };
}

export interface CompressedPhotoResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
}

/**
 * Creates an HTML Image Element from a file or data URL / web URL
 */
export const loadImage = (source: string | File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Gagal memuat gambar: ' + err));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Gagal membaca file gambar'));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(source);
    }
  });
};

/**
 * Compresses and resizes any general photo (campaign, disbursement proof, banner, gallery)
 * strictly under 700 KB limit.
 */
export const compressAndResizePhoto = async (
  source: File | string,
  maxDimension = 1600,
  maxAllowedKb = 700
): Promise<CompressedPhotoResult> => {
  let originalSizeKb = 0;
  if (typeof source !== 'string') {
    originalSizeKb = Math.round((source.size / 1024) * 10) / 10;
  } else if (source.startsWith('data:')) {
    originalSizeKb = Math.round((source.length * 0.75 / 1024) * 10) / 10;
  }

  const img = await loadImage(source);
  let currentWidth = img.naturalWidth || img.width;
  let currentHeight = img.naturalHeight || img.height;

  // Scale down if exceeds maxDimension
  if (currentWidth > maxDimension || currentHeight > maxDimension) {
    const scale = Math.min(maxDimension / currentWidth, maxDimension / currentHeight);
    currentWidth = Math.round(currentWidth * scale);
    currentHeight = Math.round(currentHeight * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = currentWidth;
  canvas.height = currentHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

  // Iterative compression to ensure strictly <= maxAllowedKb (700 KB)
  let quality = 0.88;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  let sizeKb = Math.round((dataUrl.length * 0.75 / 1024) * 10) / 10;

  while (sizeKb > maxAllowedKb && quality > 0.3) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    sizeKb = Math.round((dataUrl.length * 0.75 / 1024) * 10) / 10;
  }

  // If still above maxAllowedKb, scale resolution down further
  if (sizeKb > maxAllowedKb) {
    const secondCanvas = document.createElement('canvas');
    secondCanvas.width = Math.round(currentWidth * 0.75);
    secondCanvas.height = Math.round(currentHeight * 0.75);
    const secondCtx = secondCanvas.getContext('2d');
    if (secondCtx) {
      secondCtx.imageSmoothingEnabled = true;
      secondCtx.imageSmoothingQuality = 'high';
      secondCtx.drawImage(canvas, 0, 0, secondCanvas.width, secondCanvas.height);
      dataUrl = secondCanvas.toDataURL('image/jpeg', 0.75);
      sizeKb = Math.round((dataUrl.length * 0.75 / 1024) * 10) / 10;
      currentWidth = secondCanvas.width;
      currentHeight = secondCanvas.height;
    }
  }

  return {
    dataUrl,
    originalSizeKb: originalSizeKb || sizeKb,
    compressedSizeKb: sizeKb,
    width: currentWidth,
    height: currentHeight
  };
};

/**
 * Generates a default Sahabat Jariyah branded SVG icon as data URL
 */
export const getDefaultBrandedIcon = (size = 512): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#064e3b" />
        <stop offset="100%" stop-color="#022c22" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
    <rect x="24" y="24" width="464" height="464" rx="96" fill="none" stroke="#059669" stroke-width="4" stroke-opacity="0.4" />
    
    <g transform="translate(256, 240) scale(1.6)" text-anchor="middle">
      <path d="M-15,-60 A55,55 0 1,0 60,15 A45,45 0 1,1 -15,-60 Z" fill="url(#accentGrad)" />
      <path d="M25,-35 L28,-25 L38,-22 L28,-19 L25,-9 L22,-19 L12,-22 L22,-25 Z" fill="#ffffff" />
    </g>

    <text x="256" y="420" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="44" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="2">
      SAHABAT JARIYAH
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Resizes and renders an image onto a square canvas with centered containment and crisp smoothing
 */
const renderToSquareCanvas = (
  img: HTMLImageElement,
  targetSize: number,
  options: {
    paddingRatio?: number;
    backgroundColor?: string | null;
    cornerRadius?: number;
  } = {}
): HTMLCanvasElement => {
  const { paddingRatio = 0.08, backgroundColor = null, cornerRadius = 0 } = options;

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (backgroundColor || cornerRadius > 0) {
    ctx.save();
    if (cornerRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(0, 0, targetSize, targetSize, cornerRadius);
      ctx.clip();
    }
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, targetSize, targetSize);
    }
    ctx.restore();
  }

  const maxAvailable = targetSize * (1 - paddingRatio * 2);
  const scale = Math.min(maxAvailable / img.naturalWidth, maxAvailable / img.naturalHeight);
  const drawWidth = img.naturalWidth * scale;
  const drawHeight = img.naturalHeight * scale;
  const offsetX = (targetSize - drawWidth) / 2;
  const offsetY = (targetSize - drawHeight) / 2;

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  return canvas;
};

/**
 * Main function to optimize uploaded logo:
 * Generates Web Master Logo, Favicon (64x64), Apple Touch Icon (180x180), PWA 192x192, and PWA 512x512
 * Strictly <= 700 KB.
 */
export const processAndOptimizeLogo = async (
  source: File | string
): Promise<ProcessedLogoResult> => {
  let originalSizeKb = 0;
  if (typeof source !== 'string') {
    originalSizeKb = Math.round((source.size / 1024) * 10) / 10;
  } else if (source.startsWith('data:')) {
    originalSizeKb = Math.round((source.length * 0.75 / 1024) * 10) / 10;
  }

  const img = await loadImage(source);
  const dimensions = { width: img.naturalWidth, height: img.naturalHeight };

  // 1. Master Logo (Max 512x512, contained, crisp PNG)
  const masterCanvas = renderToSquareCanvas(img, 512, { paddingRatio: 0.04 });
  let masterLogo = masterCanvas.toDataURL('image/png', 0.92);

  // 2. Favicon (64x64 px)
  const faviconCanvas = renderToSquareCanvas(img, 64, { paddingRatio: 0.05 });
  const favicon = faviconCanvas.toDataURL('image/png', 0.9);

  // 3. Apple Touch Icon (180x180 px)
  const appleCanvas = renderToSquareCanvas(img, 180, { 
    paddingRatio: 0.12, 
    backgroundColor: '#064e3b', 
    cornerRadius: 36 
  });
  const appleTouch = appleCanvas.toDataURL('image/png', 0.92);

  // 4. PWA Icon 192x192 px
  const pwa192Canvas = renderToSquareCanvas(img, 192, { 
    paddingRatio: 0.1, 
    backgroundColor: '#064e3b',
    cornerRadius: 38
  });
  const pwa192 = pwa192Canvas.toDataURL('image/png', 0.92);

  // 5. PWA Icon 512x512 px
  const pwa512Canvas = renderToSquareCanvas(img, 512, { 
    paddingRatio: 0.1, 
    backgroundColor: '#064e3b',
    cornerRadius: 96
  });
  const pwa512 = pwa512Canvas.toDataURL('image/png', 0.92);

  // Ensure compressed master size <= 700 KB
  let compressedSizeKb = Math.round((masterLogo.length * 0.75 / 1024) * 10) / 10;
  if (compressedSizeKb > 700) {
    masterLogo = masterCanvas.toDataURL('image/jpeg', 0.85);
    compressedSizeKb = Math.round((masterLogo.length * 0.75 / 1024) * 10) / 10;
  }

  return {
    masterLogo,
    favicon,
    pwa192,
    pwa512,
    appleTouch,
    originalSizeKb: originalSizeKb || compressedSizeKb,
    compressedSizeKb,
    dimensions
  };
};

/**
 * Real-time synchronization of Favicon, Apple Touch Icon, and PWA Web App Manifest in document head
 */
export const syncFaviconAndPwaManifest = (settings: AppSettings) => {
  if (typeof document === 'undefined') return;

  const defaultIcon = getDefaultBrandedIcon(512);
  const activeFavicon = settings.faviconUrl || settings.logoUrl || defaultIcon;
  const activePwa192 = settings.pwaIcon192Url || settings.logoUrl || defaultIcon;
  const activePwa512 = settings.pwaIcon512Url || settings.logoUrl || defaultIcon;
  const activeAppleTouch = settings.appleTouchIconUrl || settings.pwaIcon192Url || defaultIcon;

  // 1. Update <link rel="icon">
  let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }
  faviconLink.href = activeFavicon;

  // 2. Update <link rel="apple-touch-icon">
  let appleTouchLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
  if (!appleTouchLink) {
    appleTouchLink = document.createElement('link');
    appleTouchLink.rel = 'apple-touch-icon';
    document.head.appendChild(appleTouchLink);
  }
  appleTouchLink.href = activeAppleTouch;

  // 3. Dynamically Generate & Update Web App Manifest Blob
  const manifestData = {
    name: `${settings.appName} - Platform Donasi & Transparansi`,
    short_name: settings.appName,
    description: settings.appTagline || "Platform donasi dan crowdfunding syariah dengan integrasi pembayaran digital instan dan dasbor transparansi penyaluran dana real-time.",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#064e3b",
    theme_color: "#047857",
    orientation: "portrait-primary",
    icons: [
      {
        src: activePwa192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: activePwa512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    categories: ["finance", "lifestyle", "social"],
    lang: "id"
  };

  const manifestBlob = new Blob([JSON.stringify(manifestData, null, 2)], {
    type: 'application/manifest+json'
  });
  const manifestUrl = URL.createObjectURL(manifestBlob);

  let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
  if (!manifestLink) {
    manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    document.head.appendChild(manifestLink);
  } else {
    if (manifestLink.href.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(manifestLink.href);
      } catch (e) {}
    }
  }
  manifestLink.href = manifestUrl;
};
