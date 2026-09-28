<script lang="ts">
	import { schemes } from '../colors/schemes';
	import { colorScheme } from './store.svelte';
	import { Direction } from './types';

	const colors = schemes[$colorScheme];

	export let index: number | null = null;
	export let position: [number, number] | null = null;
	export let type: number;
	export let likeNeighbors: Record<Direction, boolean>;
</script>

<!-- Create tile and set background color -->
<div class={{ tile: true, ...likeNeighbors }} style="--tile-color: {colors[type]}">
	{#if index !== null}
		<p class="index">
			{index}
		</p>
	{/if}
	{#if position !== null}
		<p class="position">
			{position[0]}, {position[1]}
		</p>
	{/if}
</div>

<style>
	.tile {
		--tile-color: red;
		box-sizing: border-box;
		width: var(--tile-size);
		height: var(--tile-size);
		text-align: center;
		border: 2px solid var(--color-text);
		background-color: var(--tile-color);
	}

	.tile.north {
		border-top-color: var(--tile-color);
	}
	.tile.south {
		border-bottom-color: var(--tile-color);
	}
	.tile.east {
		border-right-color: var(--tile-color);
	}
	.tile.west {
		border-left-color: var(--tile-color);
	}

	.index,
	.position {
		margin: 0;
		color: black;
	}
</style>
