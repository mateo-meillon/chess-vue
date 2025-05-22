<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Piece from './Piece.vue'
import { createInitialBoard, getCellColor, type PlayerColor, type PieceType } from '../utils/chess'
import { useChessDrag } from '../composables/useChessDrag'
import { useChessHistoryStore } from '../stores/chessHistory'

interface Props {
	color: PlayerColor
}

const props = defineProps<Props>()

const chessHistory = useChessHistoryStore()
const boardMatrix = ref<PieceType[][]>(chessHistory.currentPosition)
const boardEl = ref<HTMLElement | null>(null)
const cellSize = ref(0)
const lastMove = ref<{ from: [number, number]; to: [number, number] } | null>(null)
const hoveredCell = ref<[number, number] | null>(null)
const legalMoves = ref<{ to: [number, number]; isCapture: boolean }[]>([])
const selectedPiece = ref<[number, number] | null>(null)

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

// Watch for changes in the current position
watch(
	() => chessHistory.currentPosition,
	(newPosition) => {
		boardMatrix.value = JSON.parse(JSON.stringify(newPosition))
	},
	{ deep: true },
)

const { draggingPiece, onPieceMouseDown: originalOnPieceMouseDown, onPieceTouchStart: originalOnPieceTouchStart } = useChessDrag(boardMatrix, boardEl, cellSize, movePiece)

function deselectPiece() {
	selectedPiece.value = null
	legalMoves.value = []
}

function onBoardClick(event: MouseEvent) {
	// Only handle clicks directly on the board cells
	if (!(event.target as HTMLElement).classList.contains('chess-board__cell')) {
		return
	}

	// If we're dragging, don't deselect
	if (draggingPiece.value) {
		return
	}

	// Get the cell coordinates
	const cell = event.target as HTMLElement
	const rowIndex = parseInt(cell.dataset.row || '-1')
	const colIndex = parseInt(cell.dataset.col || '-1')

	// If clicking on a piece, don't deselect
	if (boardMatrix.value[rowIndex][colIndex]) {
		return
	}

	deselectPiece()
}

function onPieceMouseDown(rowIndex: number, colIndex: number, event: MouseEvent) {
	const type = boardMatrix.value[rowIndex][colIndex]
	if (!type) return

	// If clicking a different piece, select it
	if (!selectedPiece.value || selectedPiece.value[0] !== rowIndex || selectedPiece.value[1] !== colIndex) {
		selectedPiece.value = [rowIndex, colIndex]
		legalMoves.value = chessHistory.legalMoves
			.filter((move) => move.from[0] === rowIndex && move.from[1] === colIndex)
			.map((move) => ({
				to: [move.to[0], move.to[1]],
				isCapture: boardMatrix.value[move.to[0]][move.to[1]] !== null,
			}))
	}

	originalOnPieceMouseDown(rowIndex, colIndex, event)
}

function onPieceTouchStart(rowIndex: number, colIndex: number, event: TouchEvent) {
	const type = boardMatrix.value[rowIndex][colIndex]
	if (!type) return

	// If touching a different piece, select it
	if (!selectedPiece.value || selectedPiece.value[0] !== rowIndex || selectedPiece.value[1] !== colIndex) {
		selectedPiece.value = [rowIndex, colIndex]
		legalMoves.value = chessHistory.legalMoves
			.filter((move) => move.from[0] === rowIndex && move.from[1] === colIndex)
			.map((move) => ({
				to: [move.to[0], move.to[1]],
				isCapture: boardMatrix.value[move.to[0]][move.to[1]] !== null,
			}))
	}

	originalOnPieceTouchStart(rowIndex, colIndex, event)
}

function movePiece(from: { type: PieceType; fromRow: number; fromCol: number }, row: number, col: number) {
	if (row >= 0 && row < 8 && col >= 0 && col < 8) {
		if (row === from.fromRow && col === from.fromCol) return
		const target = boardMatrix.value[row][col]
		if (!target || (typeof target === 'string' && typeof from.type === 'string' && target[0] !== from.type[0])) {
			if (!chessHistory.canMovePiece(from.type)) return

			// Check if the move is legal using chess.js
			if (!chessHistory.isLegalMove([from.fromRow, from.fromCol], [row, col])) return

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
			deselectPiece() // Deselect after move
			return
		}
	}
}
</script>

<template>
	<div class="chess-board" ref="boardEl" @click="onBoardClick">
		<div class="chess-board__row" v-for="(row, rowIndex) in boardMatrix" :key="rowIndex">
			<div
				class="chess-board__cell"
				:data-row="rowIndex"
				:data-col="cellIndex"
				:class="[
					`chess-board__cell--${getCellColor(rowIndex, cellIndex, props.color)}`,
					draggingPiece && draggingPiece.fromRow === rowIndex && draggingPiece.fromCol === cellIndex ? 'chess-board__cell--highlight' : '',
					chessHistory.lastMove &&
					((chessHistory.lastMove.from[0] === rowIndex && chessHistory.lastMove.from[1] === cellIndex) ||
						(chessHistory.lastMove.to[0] === rowIndex && chessHistory.lastMove.to[1] === cellIndex))
						? 'chess-board__cell--lastmove'
						: '',
					hoveredCell && hoveredCell[0] === rowIndex && hoveredCell[1] === cellIndex ? 'chess-board__cell--hover' : '',
					selectedPiece && selectedPiece[0] === rowIndex && selectedPiece[1] === cellIndex ? 'chess-board__cell--selected' : '',
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
				<div
					v-if="legalMoves.some((move) => move.to[0] === rowIndex && move.to[1] === cellIndex)"
					class="legal-move-dot"
					:class="{ 'legal-move-dot--capture': legalMoves.find((move) => move.to[0] === rowIndex && move.to[1] === cellIndex)?.isCapture }"
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
		position: relative;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		cursor: pointer;

		&--light {
			background-color: #edcba5;
		}

		&--dark {
			background-color: #d8a46d;
		}

		&--selected {
			position: relative;

			/* &::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-color: rgba(255, 255, 0, 0.3);
				pointer-events: none;
				z-index: 1;
			} */
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

	&::before {
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

.chess-board__cell--hover::before {
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

	&::before {
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

.legal-move-dot {
	position: absolute;
	width: 25%;
	height: 25%;
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 50%;
	z-index: 1;

	&--capture {
		width: 100%;
		height: 100%;
		background-color: transparent;
		border: 9px solid rgba(0, 0, 0, 0.3);
		border-radius: 50%;
		box-sizing: border-box;
	}
}
</style>
