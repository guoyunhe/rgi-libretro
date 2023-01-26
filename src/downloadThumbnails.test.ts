import { downloadThumbnails } from './downloadThumbnails';

describe('action()', () => {
  it('print word', async () => {
    await downloadThumbnails('nes', { apiUrl: 'http://localhost:3333/' });
  });
});
