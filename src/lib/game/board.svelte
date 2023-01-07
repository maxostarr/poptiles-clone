<script lang="ts">
	import { flip } from 'svelte/animate';
	import Tile from './tile.svelte';

	let tiles: Array<number> = Array.from({ length: 10 }, (_, i) => i);

	function removeTile() {
		console.log('removeTile');
		// Remove the first element functionally
		tiles = tiles.slice(1);
	}
</script>

<section>
	<!-- Create ten tiles for testing -->

	<div class="board-containter">
		{#each tiles as i (i)}
			<div animate:flip={{ duration: 100 }}>
				<Tile index={i} />
			</div>
		{/each}
	</div>

	<button on:click={removeTile}>Remove Tile</button>
</section>

<style>
	.board-containter {
		display: flex;
		flex-direction: column-reverse;
		height: 900px;
	}
</style>
