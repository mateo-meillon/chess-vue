<script setup lang="ts">
import Board from './components/Board.vue'
</script>

<template>
	<div class="app">
		<Board color="white" />
	</div>
</template>

<style scoped lang="scss">
.app {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	display: grid;
	place-items: center;
}
</style>
