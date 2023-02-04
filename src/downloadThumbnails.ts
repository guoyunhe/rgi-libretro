import { download } from '@guoyunhe/downloader';
import axios from 'axios';
import { symlink } from 'fs/promises';
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
          console.log(image);
          await download(image.url, join(folder, normalize(game.name) + '.png'));
          for (let s = 0; s < game.subs.length; s++) {
            const sub = game.subs[s];
            await symlink('./' + normalize(game.name) + '.png', join(folder, normalize(sub.name) + '.png'));
          }
        }
      }
    }

    if (!res.data.meta.nextPageUrl) {
      break;
    }
  }
}
