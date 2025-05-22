<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Piece from './Piece.vue'
import { createInitialBoard, getCellColor, type PlayerColor, type PieceType } from '../utils/chess'
import { useChessDrag } from '../composables/useChessDrag'
import { useChessHistoryStore } from '../stores/chessHistory'

interface Props {
	color: PlayerColor
}

const props = defineProps<Props>()

const chessHistory = useChessHistoryStore()
const boardMatrix = ref<PieceType[][]>(createInitialBoard())
const boardEl = ref<HTMLElement | null>(null)
const cellSize = ref(0)
const lastMove = ref<{ from: [number, number]; to: [number, number] } | null>(null)
const hoveredCell = ref<[number, number] | null>(null)

function updateCellSize() {
	if (boardEl.value) {
		cellSize.value = boardEl.value.offsetWidth / 8
	}
}

onMounted(() => {
	nextTick(() => {
		updateCellSize()
		window.addEventListener('resize', updateCellSize)
	})
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', updateCellSize)
})

function movePiece(from: { type: PieceType; fromRow: number; fromCol: number }, row: number, col: number) {
	if (row >= 0 && row < 8 && col >= 0 && col < 8) {
		if (row === from.fromRow && col === from.fromCol) return
		const target = boardMatrix.value[row][col]
		if (!target || (typeof target === 'string' && typeof from.type === 'string' && target[0] !== from.type[0])) {
			if (!chessHistory.canMovePiece(from.type)) return

			const newBoard = boardMatrix.value.map((row) => [...row])
			newBoard[row][col] = from.type
			newBoard[from.fromRow][from.fromCol] = null
			boardMatrix.value = JSON.parse(JSON.stringify(newBoard))

			chessHistory.addMove({
				from: [from.fromRow, from.fromCol],
				to: [row, col],
				piece: from.type,
				capturedPiece: target,
			})

			hoveredCell.value = null
			return
		}
	}
}

const { draggingPiece, onPieceMouseDown, onPieceTouchStart } = useChessDrag(boardMatrix, boardEl, cellSize, movePiece)
</script>

<template>
	<div class="chess-board" ref="boardEl">
		<div class="chess-board__row" v-for="(row, rowIndex) in boardMatrix" :key="rowIndex">
			<div
				class="chess-board__cell"
				:class="[
					`chess-board__cell--${getCellColor(rowIndex, cellIndex, props.color)}`,
					draggingPiece && draggingPiece.fromRow === rowIndex && draggingPiece.fromCol === cellIndex ? 'chess-board__cell--highlight' : '',
					chessHistory.lastMove &&
					((chessHistory.lastMove.from[0] === rowIndex && chessHistory.lastMove.from[1] === cellIndex) ||
						(chessHistory.lastMove.to[0] === rowIndex && chessHistory.lastMove.to[1] === cellIndex))
						? 'chess-board__cell--lastmove'
						: '',
					hoveredCell && hoveredCell[0] === rowIndex && hoveredCell[1] === cellIndex ? 'chess-board__cell--hover' : '',
				]"
				v-for="(cell, cellIndex) in row"
				:key="`${rowIndex}-${cellIndex}`"
				@mouseenter="
					() => {
						if (draggingPiece) hoveredCell = [rowIndex, cellIndex]
					}
				"
				@mouseleave="
					() => {
						if (draggingPiece) hoveredCell = null
					}
				"
			>
				<Piece
					v-if="cell && !(draggingPiece && draggingPiece.fromRow === rowIndex && draggingPiece.fromCol === cellIndex && draggingPiece !== null)"
					:type="cell"
					:key="`${rowIndex}-${cellIndex}-${cell}-${draggingPiece ? 'dragging' : 'not-dragging'}`"
					@mousedown="onPieceMouseDown(rowIndex, cellIndex, $event)"
					@touchstart="onPieceTouchStart(rowIndex, cellIndex, $event)"
				/>
			</div>
		</div>
		<Piece
			v-if="draggingPiece"
			:type="draggingPiece.type as string"
			class="floating-piece"
			:style="{
				position: 'fixed',
				left: draggingPiece.x + 'px',
				top: draggingPiece.y + 'px',
				pointerEvents: 'none',
				zIndex: 1000,
				transform: 'translate(-50%, -50%)',
				width: cellSize + 'px',
				height: cellSize + 'px',
			}"
		/>
	</div>
</template>

<style scoped lang="scss">
.chess-board {
	width: calc(100vw - 2rem);
	max-width: 900px;
	height: calc(100vw - 2rem);
	max-height: 900px;

	aspect-ratio: 1;
	border-radius: 6px;
	overflow: hidden;
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: repeat(8, 1fr);

	&__row {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
	}

	&__cell {
		aspect-ratio: 1;
		display: grid;
		place-items: center;

		&--light {
			background-color: #eeeed2;
		}

		&--dark {
			background-color: #769656;
		}
	}
}

.floating-piece {
	pointer-events: none;
	position: fixed;
	z-index: 1000;
	transform: translate(-50%, -50%);

	filter: drop-shadow(0 1rem 0.5rem rgba(0, 0, 0, 0.5));
}

.chess-board__cell--highlight {
	position: relative;

	&::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #ead51597;
		pointer-events: none;
		z-index: 1;
	}
}

.chess-board__cell--hover {
	position: relative;
	z-index: 2;
}

.chess-board__cell--hover::after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border: 6px solid #ffffff;
	box-sizing: border-box;
	pointer-events: none;
	z-index: 2;
}

.chess-board__cell--lastmove {
	position: relative;
	&::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #ead51597;
		pointer-events: none;
		z-index: 1;
	}
}
</style>
