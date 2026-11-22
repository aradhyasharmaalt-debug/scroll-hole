import {createRoot} from 'react-dom/client';

const root = createRoot(document.getElementById('root')!);
const params = new URLSearchParams(location.search);
const gallery = params.get('gallery');
const film = params.get('film');

if (film !== null) {
  // Design review: play the closing film on its own (/?film=1).
  void import('./styles/tokens.css'); void import('./styles/app.css');
  void import('./film/Film').then(m => root.render(<m.Film reels={11} got={2} total={5} onDone={() => location.reload()}/>));
} else if (gallery !== null) {
  // Design review of the screenshot variants for one scene.
  void import('./Gallery').then(m => root.render(<m.Gallery scene={Number(gallery) % 11}/>));
} else {
  void import('./styles/tokens.css');
  void import('./styles/app.css');
  void import('./App').then(m => root.render(<m.App/>));
}
