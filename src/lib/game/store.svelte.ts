import { writable, type Writable, derived, get } from "svelte/store";
import Rand from "rand-seed";
import { Tile, Board, Direction, Pos } from "./types";
import { STARTING_HEIGHT, BOARD_WIDTH, BOARD_HEIGHT } from "./constants";
import { newTile, initNeighbors } from "./newTile";

export const seed = Math.random().toString();
// export const seed = "0.4574482531201898";

const rand = new Rand(seed);
export const tileTypes: Writable<Array<number>> = writable([0, 1, 2, 3]);
export const board: Writable<Board> = writable(initBoard());
export const lost = derived(board, checkLoss);
export const removedCount: Writable<number> = writable(0);
export const colorScheme: Writable<number> = writable(0);

removedCount.subscribe((count) => {
  if (count > 200) {
    tileTypes.set([0, 1, 2, 3, 4]);
  }
});

export function initBoard() {
  let board: Array<Array<Tile>> = Array(BOARD_WIDTH)
    .fill(0)
    .map(() => []) as Array<Array<Tile>>;
  for (let i = 0; i < STARTING_HEIGHT; i++) {
    console.log(board);
    board = addRow(board);
  }
  return resolveTileGroups(board);
}

export function reset() {
  board.set(initBoard());
  removedCount.set(0);
  tileTypes.set([0, 1, 2, 3]);
}

export function addRow(board: Board): Board {
  const newBoard = structuredClone(board);
  for (let x = 0; x < board.length; x++) {
    const columnBottom = board[x][0];
    const leftTwoTilesLike = x > 1 && newBoard[x - 2][0].type === newBoard[x - 1][0].type;
    const twoTopTilesLike = newBoard[x][0]?.type === newBoard[x][1]?.type;
    const availableTypes = get(tileTypes)
      .filter((t) => (twoTopTilesLike && columnBottom ? t !== columnBottom.type : true))
      .filter((t) => (leftTwoTilesLike ? t !== newBoard[x - 2][0].type : true));
    const newTileType = availableTypes[Math.floor(rand.next() * availableTypes.length)];
    newBoard[x].unshift(newTile(newTileType));
  }
  return resolveTileGroups(newBoard);
}

function findTileLocation(board: Board, tile: Tile) {
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

function findLikeAdjacentTiles(board: Board, tile: Tile) {
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

function findAllLikeConnectedTiles(board: Board, startingTile: Tile) {
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

function findTilePosInGroupsOfThree(board: Board) {
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

function removeTilesInGroupsOfThree(currentBoard: Board) {
  const board: Board = JSON.parse(JSON.stringify(currentBoard));
  const tilePositions = findTilePosInGroupsOfThree(board);
  for (const tilePos of tilePositions) {
    const [x, y] = tilePos.split("-").map(Number);
    board[x][y] = null as unknown as Tile;
    removedCount.update((c) => c + 1);
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

  function removeTilesFromBoard(board: Board, tiles: Tile[]) {
    for (const tile of tiles) {
      removeTileFromBoard(board, tile);
    }
  }

  function removeTileFromBoard(board: Board, tile: Tile) {
    const { x } = findTileLocation(board, tile);
    board[x] = board[x].filter((t) => t.id !== tile.id);
    removedCount.update((c) => c + 1);
  }
}

function resolveTileGroups(board: Board) {
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      resolveTileNeighbors(board, { x, y });
    }
  }
  return board;
}

export function checkLoss(board: Board) {
  return board.some((column) => column.length > BOARD_HEIGHT);
}

function resolveTileNeighbors(board: Board, pos: Pos) {
  const { type } = board[pos.x][pos.y];
  board[pos.x][pos.y].likeNeighbors = initNeighbors();
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
