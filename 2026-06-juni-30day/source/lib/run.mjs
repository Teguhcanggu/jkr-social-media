import { build } from './gen.mjs';
import { pieces } from '../content/pieces.mjs';
import { stories } from '../content/stories.mjs';
import { reelOverlayPieces, outro } from '../content/reels.mjs';
build([...pieces, ...stories, ...reelOverlayPieces, outro]);
