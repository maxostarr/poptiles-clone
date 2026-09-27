import { writable, type Writable, derived } from "svelte/store";
import Rand from "rand-seed";

export const tileTypes = [0, 1, 2, 3];

export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 14;
export const STARTING_HEIGHT = 3;

const Direction = ["north", "south", "east", "west"] as const;
type Direction = (typeof Direction)[number];

export interface Tile {
  id: string;
  type: number;
  likeNeighbors: Record<Direction, boolean>;
}

interface Pos {
  x: number;
  y: number;
}

// export const seed = Math.random().toString();
export const seed = "0.4574482531201898";

const rand = new Rand(seed);

export const board: Writable<Tile[][]> = writable(resolveTileGroups(initBoard()));
export const lost = derived(board, checkLoss);

function generateColumn(currentBoard: Tile[][], x: number) {
  const column: Tile[] = [];
  for (let y = 0; y < STARTING_HEIGHT; y++) {
    const { belowTwoTilesExistAndSameType, leftTwoTilesSameType } = getPositionalTypeSimilarities(
      column,
      currentBoard,
      y,
      x,
    );
    const availableTypes = getAvailableTypes(
      column,
      currentBoard,
      belowTwoTilesExistAndSameType,
      leftTwoTilesSameType,
      y,
      x,
    );

    const type = availableTypes[Math.floor(rand.next() * availableTypes.length)];
    column.push({
      id: crypto.randomUUID(),
      type,
      likeNeighbors: {
        east: false,
        north: false,
        south: false,
        west: false,
      },
    });
  }
  return column;
}

function getAvailableTypes(
  column: Tile[],
  currentBoard: Tile[][],
  belowTwoTilesExistAndSameType: boolean,
  leftTwoTilesSameType: boolean,
  y: number,
  x: number,
) {
  return tileTypes.filter(
    (type) =>
      !(belowTwoTilesExistAndSameType && type === column[y - 1]?.type) &&
      !(leftTwoTilesSameType && type === currentBoard[x - 1][y]?.type),
  );
}

function getPositionalTypeSimilarities(
  column: Tile[],
  currentBoard: Tile[][],
  y: number,
  x: number,
) {
  const leftTwoTilesSameType =
    x >= 2 && currentBoard[x - 1][y]?.type === currentBoard[x - 2][y]?.type;
  const belowTwoTilesExistAndSameType = column[y - 2]?.type === column[y - 1]?.type;
  return { belowTwoTilesExistAndSameType, leftTwoTilesSameType };
}

export function initBoard() {
  const board: Array<Array<Tile>> = Array(BOARD_WIDTH).fill([]) as Array<Array<Tile>>;
  for (let x = 0; x < BOARD_WIDTH; x++) {
    board[x] = generateColumn(board, x);
  }
  return board;
}

export function addRow(board: Tile[][]): Tile[][] {
  const newBoard = structuredClone(board);
  for (let x = 0; x < board.length; x++) {
    const columnBottom = board[x][0];
    const leftTwoTilesLike = x > 1 && newBoard[x - 2][0].type === newBoard[x - 1][0].type;
    const availableTypes = tileTypes
      .filter((t) => (columnBottom?.likeNeighbors.north ? t !== columnBottom.type : true))
      .filter((t) => (leftTwoTilesLike ? t !== newBoard[x - 2][0].type : true));
    const newTileType = availableTypes[Math.floor(rand.next() * availableTypes.length)];
    newBoard[x].unshift({
      id: crypto.randomUUID(),
      type: newTileType,
      likeNeighbors: {
        east: false,
        north: false,
        south: false,
        west: false,
      },
    });
  }
  return resolveTileGroups(newBoard);
}

function findTileLocation(board: Tile[][], tile: Tile) {
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      if (board[x][y].id === tile.id) {
        return { x, y };
      }
    }
  }
  throw new Error("Tile not found");
}

function moveInDirection(pos: Pos, direction: Direction) {
  switch (direction) {
    case "north":
      return { x: pos.x, y: pos.y + 1 };
    case "east":
      return { x: pos.x + 1, y: pos.y };
    case "south":
      return { x: pos.x, y: pos.y - 1 };
    case "west":
      return { x: pos.x - 1, y: pos.y };
  }
}

function findLikeAdjacentTiles(board: Tile[][], tile: Tile) {
  const { x, y } = findTileLocation(board, tile);
  const tiles: Tile[] = [];
  for (const direction of Object.keys(tile.likeNeighbors) as Array<keyof Tile["likeNeighbors"]>) {
    if (!tile.likeNeighbors[direction]) {
      continue;
    }
    const newPos = moveInDirection({ x, y }, direction);
    tiles.push(board[newPos.x][newPos.y]);
  }
  return tiles;
}

function findAllLikeConnectedTiles(board: Tile[][], startingTile: Tile) {
  const tiles: Tile[] = [];
  const visited: Tile[] = [];
  const queue: Tile[] = [startingTile];
  while (queue.length > 0) {
    const tile = queue.shift();
    if (!tile) {
      continue;
    }
    if (visited.includes(tile)) {
      continue;
    }
    visited.push(tile);
    tiles.push(tile);
    for (const adjacentTile of findLikeAdjacentTiles(board, tile)) {
      queue.push(adjacentTile);
    }
  }
  return tiles;
}

function isThreeLineCenter(tile: Tile) {
  return (
    (tile.likeNeighbors.east && tile.likeNeighbors.west) ||
    (tile.likeNeighbors.north && tile.likeNeighbors.south)
  );
}

function findTilePosInGroupsOfThree(board: Tile[][]) {
  const groups: Set<`${number}-${number}`> = new Set();
  for (let x = 0; x < BOARD_WIDTH; x++) {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      const tile = board[x][y];
      if (!tile) {
        continue;
      }
      // This function does not check for tiles that are in a line
      const tiles = findAllLikeConnectedTiles(board, tile);
      if (tiles.some(isThreeLineCenter)) {
        // groups.push(...tiles);
        groups.add(`${x}-${y}`);
      }
    }
  }
  return groups;
}

function removeTilesInGroupsOfThree(currentBoard: Tile[][]) {
  const board: Tile[][] = JSON.parse(JSON.stringify(currentBoard));
  const tilePositions = findTilePosInGroupsOfThree(board);
  for (const tilePos of tilePositions) {
    const [x, y] = tilePos.split("-").map(Number);
    board[x][y] = null as unknown as Tile;
  }
  const cleanedBoard = board.map((column) => column.filter(Boolean));
  return [cleanedBoard, tilePositions.size] as const;
}

export async function removeTile(x: number, y: number) {
  board.update((board) => {
    const tiles = findAllLikeConnectedTiles(board, board[x][y]);
    removeTilesFromBoard(board, tiles);

    return resolveTileGroups(board);
  });

  let newBoard;
  let tilesRemoved = 1;
  while (tilesRemoved > 0) {
    await sleep(300);
    board.update((board) => {
      // Remove all tiles in groups of three
      // Until no more tiles are removed
      [newBoard, tilesRemoved] = removeTilesInGroupsOfThree(board);
      return resolveTileGroups(newBoard);
    });
  }

  board.update(addRow);

  function removeTilesFromBoard(board: Tile[][], tiles: Tile[]) {
    for (const tile of tiles) {
      removeTileFromBoard(board, tile);
    }
  }

  function removeTileFromBoard(board: Tile[][], tile: Tile) {
    const { x } = findTileLocation(board, tile);
    board[x] = board[x].filter((t) => t.id !== tile.id);
  }
}

function resolveTileGroups(board: Tile[][]) {
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      resolveTileNeighbors(board, { x, y });
    }
  }
  return board;
}

export function checkLoss(board: Tile[][]) {
  return board.some((column) => column.length > BOARD_HEIGHT);
}

function resolveTileNeighbors(board: Tile[][], pos: { x: number; y: number }) {
  const { type } = board[pos.x][pos.y];
  board[pos.x][pos.y].likeNeighbors = {
    east: false,
    north: false,
    south: false,
    west: false,
  };
  if (pos.x > 0 && board[pos.x - 1][pos.y] && board[pos.x - 1][pos.y].type === type) {
    board[pos.x][pos.y].likeNeighbors.west = true;
  }
  if (pos.x < BOARD_WIDTH - 1 && board[pos.x + 1][pos.y] && board[pos.x + 1][pos.y].type === type) {
    board[pos.x][pos.y].likeNeighbors.east = true;
  }
  if (pos.y > 0 && board[pos.x][pos.y - 1] && board[pos.x][pos.y - 1].type === type) {
    board[pos.x][pos.y].likeNeighbors.south = true;
  }
  if (
    pos.y < BOARD_HEIGHT - 1 &&
    board[pos.x][pos.y + 1] &&
    board[pos.x][pos.y + 1].type === type
  ) {
    board[pos.x][pos.y].likeNeighbors.north = true;
  }
}

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));
