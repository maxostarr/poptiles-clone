<script lang="ts">
	const colors = ['red', 'blue', 'green', 'yellow'];

	let color = colors[Math.floor(Math.random() * colors.length)];

	export let index: number | null = null;
</script>

<!-- Create tile and set background color -->
<div class="tile" style="background-color: {color}">
	{#if index !== null}
		<p class="index">
			{index}
		</p>
	{/if}
</div>

<style>
	.tile {
		width: 100px;
		height: 100px;
	}

	.index {
		font-size: 2rem;
		margin: 0;
	}
</style>
