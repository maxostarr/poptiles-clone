<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	import Tile from './tile.svelte';
	import { board, removeTile } from './store';

	function handleTileClick(tileX: number, tileY: number) {
		console.log(
			'🚀 ~ file: board.svelte:9 ~ handleTileClick ~ tileX: number, tileY: number',
			tileX,
			tileY
		);
		console.log('🚀 ~ file: board.svelte:7 ~ board', $board);
		removeTile(tileX, tileY);
		console.log('🚀 ~ file: board.svelte:7 ~ board', $board);
	}
</script>

<section>
	<!-- Create ten tiles for testing -->

	{#each $board as row, tileX (tileX)}
		<div class="column">
			{#each row as tile, tileY (tile.index)}
				<div
					animate:flip={{ duration: 100, delay: 150 }}
					out:fade={{ duration: 100 }}
					on:click={() => handleTileClick(tileX, tileY)}
				>
					<Tile index={tile.index} />
				</div>
			{/each}
		</div>
	{/each}
</section>

<style>
	.column {
		display: flex;
		flex-direction: column-reverse;
		height: 900px;
	}

	section {
		display: flex;
		flex-direction: row;
	}
</style>
