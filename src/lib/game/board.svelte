<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';

	import Tile from './tile.svelte';
	import { lost, board, removeTile } from './store.svelte';
	import { ANIMATION_DURATION, WAIT_TIME } from './constants';
	import type { Pos } from './types';

	function handleTileClick({ x, y }: Pos) {
		if (!$lost) {
			removeTile({
				x,
				y
			});
		}
	}
</script>

<section class={{ lost: $lost }}>
	{#each $board as column, tileX (tileX)}
		<div class="column">
			{#each column as tile, tileY (tile.id)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					animate:flip={{ duration: ANIMATION_DURATION, delay: ANIMATION_DURATION + WAIT_TIME }}
					in:fly={{ y: 50, duration: ANIMATION_DURATION, delay: ANIMATION_DURATION + WAIT_TIME }}
					out:fade={{ duration: ANIMATION_DURATION }}
					on:click={() =>
						handleTileClick({
							x: tileX,
							y: tileY
						})}
				>
					<Tile type={tile.type} likeNeighbors={tile.likeNeighbors} />
				</div>
			{/each}
		</div>
	{/each}
</section>

<style>
	.lost {
		pointer-events: none;
		filter: grayscale(100%) blur(3px);
	}
	.column {
		display: flex;
		flex-direction: column-reverse;
		height: calc(var(--tile-size) * 14);
		width: 50px;
		border-top: 5px solid white;
	}

	section {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
</style>
