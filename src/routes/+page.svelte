<script>
	import Board from '$lib/game/board.svelte';

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Poptiles Clone" />
</svelte:head>

<section>
	<h1>Clone of Poptiles</h1>

    <div class="wrapper">

        <Board />
    </div>
    </section>

<style>
section {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.wrapper{
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center
}
</style>
