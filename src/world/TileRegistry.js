import tilesJson from '../data/tiles.json' with { type: 'json' };
import itemsJson from '../data/items.json' with { type: 'json' };

export const tiles = tilesJson.map((tile, index) => ({ ...tile, numId: index }));
export const tileById = new Map(tiles.map((tile) => [tile.id, tile]));

export const items = itemsJson.map((item) => ({ ...item }));
export const itemById = new Map(items.map((item) => [item.id, item]));

export const ID = {
  grass: tileById.get('grass').numId,
  dirt: tileById.get('dirt').numId,
  water: tileById.get('water').numId,
  tree: tileById.get('tree').numId,
  rock: tileById.get('rock').numId,
  wall: tileById.get('wall_wood').numId,
};

/** Prebuilt `grass_00`..`grass_15` names so chunk redraws do not allocate. */
export const groundFrames = tiles.map((tile) => {
  if (tile.layer !== 'ground' || !tile.autotile) return null;
  const frames = new Array(16);
  for (let mask = 0; mask < 16; mask++) {
    frames[mask] = `${tile.id}_${mask < 10 ? '0' : ''}${mask}`;
  }
  return frames;
});

export function getTile(id) {
  if (typeof id === 'number') return tiles[id] || null;
  return tileById.get(id) || null;
}

export function getItem(id) {
  return itemById.get(id) || null;
}
