#!/usr/bin/env node

import { Command } from 'commander';
import { downloadThumbnails } from '../downloadThumbnails';

const program = new Command('rgi-libretro');

program.description('Dump RetroGameIndex data and images to libretro projects');

program
  .command('thumbnail')
  .description('Dump images to libretro-thumbnails projects')
  .argument('[platform]', 'Game platform, like nes, gba, md, ps2')
  .option('--api-url <url>', 'RetroGameIndex API url')
  .action(downloadThumbnails);

program.helpOption('-h, --help', 'Show full help');

if (typeof PACKAGE_VERSION === 'string') {
  program.version(PACKAGE_VERSION, '-v, --version', 'Show version number');
}

program.parse();
