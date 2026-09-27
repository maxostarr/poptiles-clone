<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	import Tile from './tile.svelte';
	import { board, removeTile, seed } from './store';

	function handleTileClick(tileX: number, tileY: number) {
		removeTile(tileX, tileY);
		console.log($board);
	}
</script>

<section>
	<p>{seed}</p>
	<!-- Create ten tiles for testing -->

	{#each $board as column, tileX (tileX)}
		<div class="column">
			{#each column as tile, tileY (tile.id)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					animate:flip={{ duration: 100, delay: 150 }}
					out:fade={{ duration: 100 }}
					on:click={() => handleTileClick(tileX, tileY)}
				>
					<Tile type={tile.type} likeNeighbors={tile.likeNeighbors}/>
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
		justify-content: center;
	}
</style>
