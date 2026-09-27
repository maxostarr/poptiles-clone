<script lang="ts">
	const colors = ['red', 'blue', 'green', 'yellow'];

	export let index: number | null = null;
	export let position: [number, number] | null = null;
	export let type: number;
	export let likeNeighbors: {
		north: boolean;
		south: boolean;
		east: boolean;
		west: boolean;
	};

    // const colorClass = `color-${type}`

</script>


<!-- Create tile and set background color -->
<div class={{ tile: true, ...likeNeighbors }} style="--tile-color: {colors[type]}" >
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
		width: 50px;
		height: 50px;
		text-align: center;
		border: 2px solid white;
        background-color: var(--tile-color)
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
