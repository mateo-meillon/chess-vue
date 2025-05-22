<script setup lang="ts">
import { useChessHistoryStore } from '../stores/chessHistory'

const chessHistory = useChessHistoryStore()
</script>

<template>
	<div id="game-details">
		<div class="current-turn" v-if="chessHistory.viewingHistory">
			Viewing move history
			<button class="return-button" @click="chessHistory.returnToCurrent">Return to current position</button>
		</div>
		<div class="move-history">
			<div v-for="(_, index) in Math.ceil(chessHistory.moveHistory.length / 2)" :key="index" class="move-entry">
				<div class="move-number">{{ index + 1 }}.</div>
				<div class="move-notation white" :class="{ active: chessHistory.currentMoveIndex === index * 2 }" @click="chessHistory.viewPosition(index * 2)">
					{{ chessHistory.moveHistory[index * 2] ? chessHistory.getMoveNotation(chessHistory.moveHistory[index * 2]) : '' }}
				</div>
				<div class="move-notation black" :class="{ active: chessHistory.currentMoveIndex === index * 2 + 1 }" @click="chessHistory.viewPosition(index * 2 + 1)">
					{{ chessHistory.moveHistory[index * 2 + 1] ? chessHistory.getMoveNotation(chessHistory.moveHistory[index * 2 + 1]) : '' }}
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
#game-details {
	height: calc(100vw - 2rem);
	max-height: 900px;
	width: 400px;
	box-sizing: border-box;

	border-radius: 6px;
	background-color: #2d2d39;
	color: #ffffff;
	overflow-y: auto;

	.current-turn {
		border-bottom: 1px solid #444;
		font-size: 1.2rem;
		padding: 12px 24px;
		display: flex;
		align-items: center;
		gap: 1rem;

		.return-button {
			margin-left: auto;
			padding: 4px 12px;
			border-radius: 4px;
			background-color: #51515e;
			border: none;
			color: white;
			cursor: pointer;
			transition: background-color 0.1s ease-in-out;

			&:hover {
				background-color: #666;
			}
		}
	}

	.move-history {
		display: flex;
		flex-direction: column;
		font-family: monospace;
		font-size: 1.1rem;
		padding: 12px 0;

		.move-entry {
			display: grid;
			grid-template-columns: auto 1fr 1fr;
			align-items: center;

			.move-number {
				color: #888;
				min-width: 2rem;
				margin-left: 12px;
			}

			.move-notation {
				padding: 0.25rem 0.5rem;
				border-radius: 3px;
				transition: all 0.1s ease-in-out;
				cursor: pointer;

				&.white {
					color: #eeeed2;
				}

				&.black {
					color: #769656;
				}

				&:hover {
					background-color: #51515e;
				}

				&.active {
					background-color: #51515e;
					font-weight: bold;
				}
			}

			&:nth-child(even) {
				background-color: #3d3d49;
			}
		}
	}
}
</style>
