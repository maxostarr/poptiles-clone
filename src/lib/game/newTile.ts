import { Tile, Direction } from "./types";

export const newTile = (type: number): Tile => ({
  id: crypto.randomUUID(),
  type,
  likeNeighbors: initNeighbors(),
});
export function initNeighbors(): Record<Direction, boolean> {
  return {
    east: false,
    north: false,
    south: false,
    west: false,
  };
}
