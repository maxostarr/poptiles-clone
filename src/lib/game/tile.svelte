<script lang="ts">
	const colors = [
		'red',
		'blue',
		'green',
		'yellow',
		'orange',
		'purple',
		'pink',
		'brown',
		'black',
		'white'
	];

	let color = colors[Math.floor(Math.random() * colors.length)];

	export let index: number;
</script>

<!-- Create tile and set background color -->
<div class="tile" style="background-color: {color}">
	<p class="index">
		{index}
	</p>
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
