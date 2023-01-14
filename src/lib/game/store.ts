import { writable, type Writable } from 'svelte/store';

export const tileTypes = [0, 1, 2, 3];

export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 14;
export const STARTING_HEIGHT = 3;

export interface Tile {
	id: string;
	type: number;
}

export const board: Writable<Tile[][]> = writable([[{ id: '1', type: 0 }]]);

function generateColumn(currentBoard: Tile[][], x: number) {
	const column: Tile[] = [];
	for (let y = 0; y < STARTING_HEIGHT; y++) {
		const { belowTwoTilesExistAndSameType, leftTwoTilesSameType } = getPositionalTypeSimilarities(
			column,
			currentBoard,
			y,
			x
		);
		const availableTypes = getAvailableTypes(
			column,
			currentBoard,
			belowTwoTilesExistAndSameType,
			leftTwoTilesSameType,
			y,
			x
		);

		const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
		column.push({
			id: crypto.randomUUID(),
			type
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
	x: number
) {
	return tileTypes.filter(
		(type) =>
			!(belowTwoTilesExistAndSameType && type === column[y - 1]?.type) &&
			!(leftTwoTilesSameType && type === currentBoard[x - 1][y]?.type)
	);
}

function getPositionalTypeSimilarities(
	column: Tile[],
	currentBoard: Tile[][],
	y: number,
	x: number
) {
	const leftTwoTilesSameType =
		x >= 2 && currentBoard[x - 1][y]?.type === currentBoard[x - 2][y]?.type;
	const belowTwoTilesExistAndSameType = column[y - 2]?.type === column[y - 1]?.type;
	return { belowTwoTilesExistAndSameType, leftTwoTilesSameType };
}

function initBoard() {
	const board: Array<Array<Tile>> = Array(BOARD_WIDTH).fill([]) as Array<Array<Tile>>;
	for (let x = 0; x < BOARD_WIDTH; x++) {
		board[x] = generateColumn(board, x);
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

function findTilesInGroupsOfThree(board: Tile[][]) {
	const groups: Tile[] = [];
	for (let x = 0; x < BOARD_WIDTH; x++) {
		for (let y = 0; y < BOARD_HEIGHT; y++) {
			const tile = board[x][y];
			if (!tile) {
				continue;
			}
			// This function does not check for tiles that are in a line
			const tiles = findAllLikeConnectedTiles(board, tile);
			if (tiles.length >= 3) {
				groups.push(...tiles);
			}
		}
	}
	return groups;
}

function removeTilesInGroupsOfThree(currentBoard: Tile[][]) {
	const board: Tile[][] = JSON.parse(JSON.stringify(currentBoard));
	const tiles = findTilesInGroupsOfThree(board);
	for (const tile of tiles) {
		const { x } = findTileLocation(board, tile);
		board[x] = board[x].filter((t) => t.id !== tile.id);
	}
	return [board, tiles.length] as const;
}

export function removeTile(x: number, y: number) {
	board.update((board) => {
		const tiles = findAllLikeConnectedTiles(board, board[x][y]);
		for (const tile of tiles) {
			const { x } = findTileLocation(board, tile);
			board[x] = board[x].filter((t) => t.id !== tile.id);
		}

		// Remove all tiles in groups of three
		// Until no more tiles are removed
		let [newBoard, tilesRemoved] = removeTilesInGroupsOfThree(board);
		// while (tilesRemoved > 0) {
		// 	[newBoard, tilesRemoved] = removeTilesInGroupsOfThree(newBoard);
		// }
		board = newBoard;

		return board;
	});
}

board.set(initBoard());
