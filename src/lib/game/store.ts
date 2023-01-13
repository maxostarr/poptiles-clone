import { writable } from 'svelte/store';

export const tileTypes = [0, 1, 2, 3];

export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 14;

export interface Tile {
	id: string;
	type: number;
}

function initBoard() {
	const board: Array<Array<Tile>> = [];
	for (let x = 0; x < BOARD_WIDTH; x++) {
		board.push([]);
		for (let y = 0; y < 10; y++) {
			board[x].push({
				id: crypto.randomUUID(),
				type: tileTypes[Math.floor(Math.random() * tileTypes.length)]
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

function findTileLocation(board: Tile[][], tile: Tile) {
	for (let x = 0; x < board.length; x++) {
		for (let y = 0; y < board[x].length; y++) {
			if (board[x][y].id === tile.id) {
				return { x, y };
			}
		}
	}
	throw new Error('Tile not found');
}

function findLikeAdjacentTiles(board: Tile[][], tile: Tile) {
	const { x, y } = findTileLocation(board, tile);
	const tiles: Tile[] = [];
	for (const adjacentTile of getAdjacentTiles(board, x, y)) {
		if (adjacentTile.type === tile.type) {
			tiles.push(adjacentTile);
		}
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

export function removeTile(x: number, y: number) {
	board.update((board) => {
		const tiles = findAllLikeConnectedTiles(board, board[x][y]);
		for (const tile of tiles) {
			const { x } = findTileLocation(board, tile);
			board[x] = board[x].filter((t) => t.id !== tile.id);
		}
		return board;
	});
}

export const board = writable(initBoard());
