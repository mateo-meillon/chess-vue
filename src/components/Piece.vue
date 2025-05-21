<script setup lang="ts">
import klt45 from '../assets/pieces/Chess_klt45.svg'
import qlt45 from '../assets/pieces/Chess_qlt45.svg'
import rlt45 from '../assets/pieces/Chess_rlt45.svg'
import blt45 from '../assets/pieces/Chess_blt45.svg'
import nlt45 from '../assets/pieces/Chess_nlt45.svg'
import plt45 from '../assets/pieces/Chess_plt45.svg'
import kdt45 from '../assets/pieces/Chess_kdt45.svg'
import qdt45 from '../assets/pieces/Chess_qdt45.svg'
import rdt45 from '../assets/pieces/Chess_rdt45.svg'
import bdt45 from '../assets/pieces/Chess_bdt45.svg'
import ndt45 from '../assets/pieces/Chess_ndt45.svg'
import pdt45 from '../assets/pieces/Chess_pdt45.svg'

const props = defineProps<{
	type: string // e.g., 'wK', 'bQ', etc.
}>()

const emit = defineEmits(['mousedown', 'touchstart'])

// Map piece codes to SVG filenames
const pieceMap: Record<string, string> = {
	wK: klt45,
	wQ: qlt45,
	wR: rlt45,
	wB: blt45,
	wN: nlt45,
	wP: plt45,
	bK: kdt45,
	bQ: qdt45,
	bR: rdt45,
	bB: bdt45,
	bN: ndt45,
	bP: pdt45,
}
</script>

<template>
	<img v-if="pieceMap[type]" :src="pieceMap[type]" :alt="type" class="piece" draggable="false" @mousedown="(e) => emit('mousedown', e)" @touchstart="(e) => emit('touchstart', e)" />
</template>

<style scoped>
.piece {
	position: relative;
	z-index: 2;

	width: calc(100% - 0.5rem);
	height: calc(100% - 0.5rem);
	cursor: grab;

	filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0));
	transition: filter 0.1s ease-in-out;
}
</style>
