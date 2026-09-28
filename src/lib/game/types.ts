export const Direction = ["north", "south", "east", "west"] as const;
export type Direction = (typeof Direction)[number];

export interface Tile {
  id: string;
  type: number;
  likeNeighbors: Record<Direction, boolean>;
}
export interface Pos {
  x: number;
  y: number;
}
export type Board = Tile[][];
