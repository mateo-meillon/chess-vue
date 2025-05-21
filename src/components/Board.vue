<script setup lang="ts">
import { computed } from 'vue'

type PlayerColor = 'white' | 'black'
type CellColor = 'light' | 'dark'

interface Props {
	color: PlayerColor
}

const props = defineProps<Props>()
const alphabet = 'abcdefgh'

const boardMatrix = computed(() => {
	const isWhite = props.color === 'white'
	return Array.from({ length: 8 }, (_, i) => {
		const row = isWhite ? 7 - i : i
		return Array.from({ length: 8 }, (_, j) => {
			const col = isWhite ? j : 7 - j
			return alphabet[col] + (row + 1)
		})
	})
})

const getCellColor = computed(() => (rowIndex: number, cellIndex: number): CellColor => {
	const isWhite = props.color === 'white'
	const row = isWhite ? 7 - rowIndex : rowIndex
	const col = isWhite ? cellIndex : 7 - cellIndex
	return (row + col) % 2 === 1 ? 'light' : 'dark'
})
</script>

<template>
	<div class="chess-board">
		<div class="chess-board__row" v-for="(row, rowIndex) in boardMatrix" :key="rowIndex">
			<div class="chess-board__cell" :class="`chess-board__cell--${getCellColor(rowIndex, cellIndex)}`" v-for="(_, cellIndex) in row" :key="cellIndex"></div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.chess-board {
	height: 100%;
	aspect-ratio: 1;
	max-height: 80vh;
	max-width: 80vw;
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

		&--light {
			background-color: #eeeed2;
		}

		&--dark {
			background-color: #769656;
		}
	}
}
</style>
