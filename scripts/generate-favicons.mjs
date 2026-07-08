import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// SVG with padding (20% padding on each side)
const createPaddedSvg = (size, padding = 0.2) => {
  const logoWidth = 120.85;
  const logoHeight = 153.48;
  const aspectRatio = logoWidth / logoHeight;

  // Calculate logo size within padded area
  const availableSize = size * (1 - padding * 2);
  let scaledWidth, scaledHeight;

  if (aspectRatio > 1) {
    scaledWidth = availableSize;
    scaledHeight = availableSize / aspectRatio;
  } else {
    scaledHeight = availableSize;
    scaledWidth = availableSize * aspectRatio;
  }

  const offsetX = (size - scaledWidth) / 2;
  const offsetY = (size - scaledHeight) / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#FDF8F3"/>
  <g transform="translate(${offsetX}, ${offsetY}) scale(${scaledWidth / logoWidth})">
    <path fill="#1A1A1A" d="M27.1,132.65H0v-2.14s12.79-.52,13.21-9.02-.2-71.33-.2-71.33V15.13S12.42,3,.05,2.18V0h51.71s42.12,1.02,42.79,31.1c.42,18.77-24.55,35.43-24.55,35.43,0,0-19.17,13.26-25.41,21.28-9.14,11.74-21.03,32.14-6.74,52.25,9.8,13.8,30.65,13.88,41.89,8.08,9.31-4.8,22.44-14.82,21.7-43.42-.92-35.65-21.67-41.4-20.19-41.36,10.73.34,19.05,5.84,19.05,5.84,10.91,5.35,19.94,17.49,20.53,34.3.54,15.34-8.93,26.36-15.4,32.35-20.09,18.59-42.83,19.74-53.95,15.73-10.08-3.63-17.18-12.02-19.91-21.08-2.86-9.5-2.12-19.34-.74-24.4.78-2.87,2.3-15.05,25.18-35.8,6-5.44,18.15-16.52,17.75-37.22-.09-4.83-2.67-33.65-44.69-29.83,0,0-.32,33.43-.53,41.3s-1.45,88.09-1.45,88.09Z"/>
  </g>
</svg>`;
};

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  console.log('Generating favicons...\n');

  for (const { name, size } of sizes) {
    const svg = createPaddedSvg(size);
    const outputPath = join(publicDir, name);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`Created: ${name} (${size}x${size})`);
  }

  // Create favicon.svg for modern browsers
  const svgFavicon = createPaddedSvg(32);
  await writeFile(join(publicDir, 'favicon.svg'), svgFavicon);
  console.log('Created: favicon.svg');

  // Create ICO file (32x32)
  const icoSvg = createPaddedSvg(32);
  await sharp(Buffer.from(icoSvg))
    .png()
    .toFile(join(publicDir, 'favicon.ico'));
  console.log('Created: favicon.ico');

  console.log('\nDone! Add this to your app/layout.tsx metadata:');
  console.log(`
icons: {
  icon: [
    { url: '/favicon.ico' },
    { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
  ],
  apple: [
    { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
},
`);
}

generateFavicons().catch(console.error);
