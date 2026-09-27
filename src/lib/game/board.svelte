<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';

	import Tile from './tile.svelte';
	import { addRow, board, checkLoss, removeTile, seed } from './store';

    let lost = false

    board.subscribe((board) => {
        lost = checkLoss(board)
    })

	function handleTileClick(tileX: number, tileY: number) {
        if (!lost) {
            removeTile(tileX, tileY);
        }
	}
</script>


<section class={{lost}}>
	{#each $board as column, tileX (tileX)}
		<div class="column">
			{#each column as tile, tileY (tile.id)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					animate:flip={{ duration: 100, delay: 150 }}
                    in:fly={{y: 50, duration: 100, delay: 150}}
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
    .lost {
        pointer-events: none;
        filter: grayscale(100%);
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
