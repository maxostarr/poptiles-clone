import { writable } from 'svelte/store';

export const tileTypes = [1, 2, 3, 4];

export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 14;

export interface Tile {
	index: number;
	type: number;
}

function initBoard() {
	const board: Array<Array<Tile>> = [];
	for (let y = 0; y < BOARD_HEIGHT; y++) {
		board.push([]);
		for (let x = 0; x < 3; x++) {
			board[y].push({
				index: y * BOARD_WIDTH + x,
				type: tileTypes[Math.floor(Math.random() * tileTypes.length)]
			});
		}
	}
	return board;
}

export function removeTile(x: number, y: number) {
	board.update((board) => {
		board[x] = board[x].filter((_, i) => i !== y);
		return board;
	});
}

export const board = writable(initBoard());
