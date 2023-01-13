<script lang="ts">
	const colors = ['red', 'blue', 'green', 'yellow'];

	export let index: number | null = null;
	export let position: [number, number] | null = null;
	export let type: number;
</script>

<!-- Create tile and set background color -->
<div class="tile" style="background-color: {colors[type]}">
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
		width: 50px;
		height: 50px;
		text-align: center;
	}

	.index,
	.position {
		margin: 0;
		color: black;
	}
</style>
