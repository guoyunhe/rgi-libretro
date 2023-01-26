import { download } from '@guoyunhe/downloader';
import axios from 'axios';
import { join } from 'path';

const typesDict = {
  boxart: 'Named_Boxarts',
  snap: 'Named_Snaps',
  title: 'Named_Titles',
};

export interface Options {
  apiUrl?: string;
}

export async function downloadThumbnails(platform: string, { apiUrl = 'https://rgi-api.guoyunhe.me/' }: Options) {
  axios.defaults.baseURL = apiUrl;
  for (let i = 0; i < 999; i++) {
    const res = await axios.get('/games', {
      params: {
        page: 1,
        perPage: 100,
        platform,
      },
    });

    const games = await res.data.data;

    for (let j = 0; j < games.length; j++) {
      const game = games[j];
      for (let k = 0; k < 3; k++) {
        const [type, folder] = Object.entries(typesDict)[k];
        const image = game.images.find((img: any) => img.type === type);
        await download(image.url, join(folder, game.name + '.png'));
      }
    }

    if (!res.data.meta.nextPageUrl) {
      break;
    }
  }
}
