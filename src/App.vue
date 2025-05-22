<script setup lang="ts">
import Board from './components/Board.vue'
import GameDetails from './components/GameDetails.vue'
</script>

<template>
	<div class="app">
		<Board color="white" />
		<GameDetails />
	</div>
</template>

<style scoped lang="scss">
.app {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	display: flex;
	justify-content: center;
	align-items: center;
	gap: 2rem;
}

* {
	user-select: none;
}
</style>
