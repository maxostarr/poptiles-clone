<script>
	import Board from '$lib/game/board.svelte';
	import {board, initBoard, lost} from '$lib/game/store';

    function resetBoard() {
        board.set(initBoard())
    }
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Poptiles Clone" />
</svelte:head>

<section>
	<h1>Clone of Poptiles</h1>

    <div class="wrapper">
        {#if $lost}
            <button on:click={resetBoard}>Retry</button>
        {/if}
        <Board />
    </div>
    </section>

<style>
section {
    flex: 1;
    display: flex;
    flex-direction: column;
}

button {
    -webkit-appearance: none;
  border-radius: 0;
  text-align: inherit;
  background: none;
  box-shadow: none;
  padding: 0;
  cursor: pointer;
  border: none;
  color: inherit;
  font: inherit;
  background-color: #03fceca0;
  width: calc(var(--tile-size)*2);
  height: calc(var(--tile-size)*2);
  text-align: center;
  border-radius: 50%;
    position: absolute;
    top: 50%;
    left: calc(50%-var(--tile-size));
    z-index: 10;
}

.wrapper{
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center
}
</style>
