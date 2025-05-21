<script setup lang="ts">
const props = defineProps<{
	type: string // e.g., 'wK', 'bQ', etc.
}>()

const emit = defineEmits(['mousedown', 'touchstart'])

// Map piece codes to SVG filenames
const pieceMap: Record<string, string> = {
	wK: 'Chess_klt45.svg',
	wQ: 'Chess_qlt45.svg',
	wR: 'Chess_rlt45.svg',
	wB: 'Chess_blt45.svg',
	wN: 'Chess_nlt45.svg',
	wP: 'Chess_plt45.svg',
	bK: 'Chess_kdt45.svg',
	bQ: 'Chess_qdt45.svg',
	bR: 'Chess_rdt45.svg',
	bB: 'Chess_bdt45.svg',
	bN: 'Chess_ndt45.svg',
	bP: 'Chess_pdt45.svg',
}

const src = `/src/assets/pieces/${pieceMap[props.type]}`
</script>

<template>
	<img v-if="pieceMap[type]" :src="src" :alt="type" class="piece" draggable="false" @mousedown="(e) => emit('mousedown', e)" @touchstart="(e) => emit('touchstart', e)" />
</template>

<style scoped>
.piece {
	width: calc(100% - 0.5rem);
	height: calc(100% - 0.5rem);
	cursor: grab;
}
</style>
