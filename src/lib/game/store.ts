import { writable } from 'svelte/store';

export const tileTypes = [0, 1, 2, 3];

export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 14;

export interface Tile {
	id: string;
	x: number;
	y: number;
	type: number;
}

function initBoard() {
	const board: Array<Array<Tile>> = [];
	for (let x = 0; x < BOARD_WIDTH; x++) {
		board.push([]);
		for (let y = 0; y < 3; y++) {
			board[x].push({
				id: crypto.randomUUID(),
				type: tileTypes[Math.floor(Math.random() * tileTypes.length)],
				x,
				y
			});
		}
	}
	return board;
}

function* getAdjacentTiles(board: Tile[][], x: number, y: number) {
	if (x > 0 && board[x - 1][y]) {
		yield board[x - 1][y];
	}
	if (x < BOARD_WIDTH - 1 && board[x + 1][y]) {
		yield board[x + 1][y];
	}
	if (y > 0 && board[x][y - 1]) {
		yield board[x][y - 1];
	}
	if (y < BOARD_HEIGHT - 1 && board[x][y + 1]) {
		yield board[x][y + 1];
	}
}

function findLikeAdjacentTiles(board: Tile[][], x: number, y: number) {
	const tile = board[x][y];
	const tiles: Tile[] = [];
	for (const adjacentTile of getAdjacentTiles(board, x, y)) {
		if (adjacentTile.type === tile.type) {
			tiles.push(adjacentTile);
		}
	}
	return tiles;
}

function findAllLikeConnectedTiles(board: Tile[][], x: number, y: number) {
	const tiles: Tile[] = [];
	const visited: Tile[] = [];
	const queue: Tile[] = [board[x][y]];
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
		for (const adjacentTile of findLikeAdjacentTiles(board, x, y)) {
			queue.push(adjacentTile);
		}
	}
	return tiles;
}

export function removeTile(x: number, y: number) {
	board.update((board) => {
		const tiles = findAllLikeConnectedTiles(board, x, y);
		console.log('🚀 ~ file: store.ts:81 ~ board.update ~ tiles', tiles);
		for (const tile of tiles) {
			board[tile.x] = board[tile.x].filter((t) => t.id !== tile.id);
		}
		return board;
	});
}

export const board = writable(initBoard());
