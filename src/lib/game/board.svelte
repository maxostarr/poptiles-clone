<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	import Tile from './tile.svelte';
	import { board, BOARD_WIDTH, removeTile } from './store';

	function handleTileClick(tileX: number, tileY: number) {
		removeTile(tileX, tileY);
		console.log($board);
	}
</script>

<section>
	<!-- Create ten tiles for testing -->

	{#each $board as column, tileX (tileX)}
		<div class="column">
			{#each column as tile, tileY (tile.id)}
				<div
					animate:flip={{ duration: 100, delay: 150 }}
					out:fade={{ duration: 100 }}
					on:click={() => handleTileClick(tileX, tileY)}
				>
					<Tile />
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
		width: 50px;
	}

	section {
		display: flex;
		flex-direction: row;
	}
</style>
