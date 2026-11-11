import gameConfig from './data/config.json' with { type: 'json' };

export const TILE = 16;
export const ZOOM = 3;
export const CHUNK = 32;
export const WORLD_CHUNKS = 8;
export const WORLD_SIZE = CHUNK * WORLD_CHUNKS;
export const WORLD_PIXELS = WORLD_SIZE * TILE;

/** Pixels per second. Not in config.json; kept here with the other code tunables. */
export const PLAYER_SPEED = 88;

/** Feet collision box: one tile wide, shorter than a tile so it sits at the feet. */
export const FEET_HALF_W = TILE / 2;
export const FEET_HEIGHT = 8;

/** Block layer: 0 is empty. Grass is ground id 0, so the layers do not share that meaning. */
export const BLOCK_EMPTY = 0;
/** Harvested tree. Not a tiles.json id; append-only data stays untouched. */
export const BLOCK_STUMP = 0xffff;

export const SPAWN_TILE_X = WORLD_SIZE >> 1;
export const SPAWN_TILE_Y = WORLD_SIZE >> 1;

export const config = gameConfig;
