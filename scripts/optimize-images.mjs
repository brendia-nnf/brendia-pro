import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SOURCE_DIR = '/Users/brunocukic/BrendiaPro';
const OUTPUT_DIR = '/Users/brunocukic/BrendiaPro/brendia-pro/public/images';

const imageConfigs = {
  hero: { width: 1200, height: 1500, quality: 85 },
  about: { width: 800, height: 1000, quality: 85 },
  portrait: { width: 600, height: 800, quality: 85 },
  course: { width: 800, height: 600, quality: 85 },
  landscape: { width: 1200, height: 800, quality: 85 },
  videoPoster: { width: 1280, height: 720, quality: 85 },
  og: { width: 1200, height: 630, quality: 90 },
  skills: { width: 600, height: 400, quality: 85 },
};

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function optimizeImage(inputPath, outputPath, config) {
  try {
    const resizeOptions = {
      fit: 'cover',
      position: 'center',
    };
    if (config.width) resizeOptions.width = config.width;
    if (config.height) resizeOptions.height = config.height;

    await sharp(inputPath)
      .resize(resizeOptions)
      .jpeg({ quality: config.quality, progressive: true })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    console.log(`✓ ${path.basename(outputPath)} - ${(stats.size / 1024).toFixed(0)}KB`);
  } catch (err) {
    console.error(`✗ Error processing ${inputPath}: ${err.message}`);
  }
}

async function processImages() {
  console.log('Starting image optimization with new selections...\n');

  const photoshootDir = `${SOURCE_DIR}/Photoshoot images`;

  // Hero image - NINA-77 (full body with blonde extensions)
  console.log('Processing hero image...');
  await optimizeImage(
    `${photoshootDir}/NINA-77.jpg`,
    `${OUTPUT_DIR}/hero-nikolina.jpg`,
    imageConfigs.hero
  );

  // Video poster - NINA-32 (clean portrait, ready to speak)
  console.log('\nProcessing video poster...');
  await optimizeImage(
    `${photoshootDir}/NINA-32.jpg`,
    `${OUTPUT_DIR}/video-poster.jpg`,
    imageConfigs.videoPoster
  );

  // About founder section on homepage - NINA-56 (full body with rack)
  console.log('\nProcessing about founder image...');
  await optimizeImage(
    `${photoshootDir}/NINA-56.jpg`,
    `${OUTPUT_DIR}/nikolina-about.jpg`,
    imageConfigs.about
  );

  // About page hero - NINA-59 (landscape with extensions)
  console.log('\nProcessing about page hero...');
  await optimizeImage(
    `${photoshootDir}/NINA-59.jpg`,
    `${OUTPUT_DIR}/about-hero.jpg`,
    imageConfigs.landscape
  );

  // About page portrait - NINA-75 (B&W editorial)
  console.log('\nProcessing about page portrait...');
  await optimizeImage(
    `${photoshootDir}/NINA-75.jpg`,
    `${OUTPUT_DIR}/nikolina-portrait.jpg`,
    imageConfigs.portrait
  );

  // Foundation course - NINA-63 (extensions close-up)
  console.log('\nProcessing course images...');
  await optimizeImage(
    `${photoshootDir}/NINA-63.jpg`,
    `${OUTPUT_DIR}/courses/foundation.jpg`,
    imageConfigs.course
  );

  // Master course - NINA-101 (scissors artistic)
  await optimizeImage(
    `${photoshootDir}/NINA-101.jpg`,
    `${OUTPUT_DIR}/courses/master.jpg`,
    imageConfigs.course
  );

  // OG image - NINA-99 (striking scissors close-up)
  console.log('\nProcessing OG image...');
  await optimizeImage(
    `${photoshootDir}/NINA-99.jpg`,
    `${OUTPUT_DIR}/og-image.jpg`,
    imageConfigs.og
  );

  // Additional images for courses page
  console.log('\nProcessing additional course page images...');

  // Skills/technique images
  await optimizeImage(
    `${photoshootDir}/NINA-63.jpg`,
    `${OUTPUT_DIR}/skills-extensions.jpg`,
    imageConfigs.skills
  );

  await optimizeImage(
    `${photoshootDir}/NINA-101.jpg`,
    `${OUTPUT_DIR}/skills-precision.jpg`,
    imageConfigs.skills
  );

  // Instructor image for courses page
  await optimizeImage(
    `${photoshootDir}/NINA-59.jpg`,
    `${OUTPUT_DIR}/instructor.jpg`,
    imageConfigs.landscape
  );

  console.log('\n✓ Image optimization complete!');
}

processImages().catch(console.error);
