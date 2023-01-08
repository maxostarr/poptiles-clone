<script lang="ts">
	const colors = ['red', 'blue', 'green', 'yellow'];

	export let index: number | null = null;
	export let type: number;
</script>

<!-- Create tile and set background color -->
<div class="tile" style="background-color: {colors[type]}">
	{#if index !== null}
		<p class="index">
			{index}
		</p>
	{/if}
</div>

<style>
	.tile {
		width: 50px;
		height: 50px;
	}

	.index {
		font-size: 2rem;
		margin: 0;
	}
</style>
