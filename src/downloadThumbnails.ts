import { download } from '@guoyunhe/downloader';
import axios from 'axios';
import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { readFile, rm, symlink } from 'fs/promises';
import { join } from 'path';

const typesDict = {
  boxart: 'Named_Boxarts',
  snap: 'Named_Snaps',
  title: 'Named_Titles',
};

function normalize(file: string) {
  return file.replaceAll('&', '_');
}

export interface Options {
  apiUrl?: string;
}

export async function downloadThumbnails(platform: string, { apiUrl = 'https://rgi-api.guoyunhe.me/' }: Options) {
  axios.defaults.baseURL = apiUrl;
  const { data: platforms } = await axios.get<any[]>('/platforms');
  const platformId = platforms.find((p) => p.code === platform).id;
  for (let i = 1; i < 999; i++) {
    const res = await axios.get('/games', {
      params: {
        page: i,
        perPage: 50,
        platform: platformId,
      },
    });

    const games = res.data.data;

    for (let j = 0; j < games.length; j++) {
      const game = games[j];
      console.log(game.images);
      for (let k = 0; k < 3; k++) {
        const [type, folder] = Object.entries(typesDict)[k];
        const image = game.images.find((img: any) => img.type === type);
        if (image) {
          const imagePath = join(folder, normalize(game.name) + '.png');
          if (existsSync(imagePath)) {
            const buffer = await readFile(imagePath);
            const hash = createHash('md5').update(buffer).digest('hex');
            if (image.path === 'images/' + hash + '.png') {
              continue; // same as local file, skip downloading
            }
          }
          console.log('download', image.url);
          await download(image.url, imagePath);
          for (let s = 0; s < game.subs.length; s++) {
            const sub = game.subs[s];
            const target = './' + normalize(game.name) + '.png';
            const link = join(folder, normalize(sub.name) + '.png');
            await rm(link, { force: true });
            await symlink(target, link);
          }
        }
      }
    }

    if (!res.data.meta.nextPageUrl) {
      break;
    }
  }
}
