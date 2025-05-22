import { defineStore } from 'pinia'
import type { PieceType } from '../utils/chess'
import type { PlayerColor } from '../utils/chess'

interface ChessMove {
	from: [number, number]
	to: [number, number]
	piece: PieceType
	capturedPiece: PieceType | null
}

export const useChessHistoryStore = defineStore('chessHistory', {
	state: () => ({
		moves: [] as ChessMove[],
		currentMoveIndex: -1,
		currentTurn: 'white' as PlayerColor,
	}),

	getters: {
		lastMove: (state) => state.moves[state.currentMoveIndex] || null,
		moveHistory: (state) => state.moves,
		isWhiteTurn: (state) => state.currentTurn === 'white',
	},

	actions: {
		addMove(move: ChessMove) {
			// If we're not at the end of the history, remove all moves after current position
			if (this.currentMoveIndex < this.moves.length - 1) {
				this.moves = this.moves.slice(0, this.currentMoveIndex + 1)
			}
			this.moves.push(move)
			this.currentMoveIndex = this.moves.length - 1
			// Switch turns
			this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white'
		},

		getMoveNotation(move: ChessMove): string {
			const pieceSymbols: Record<string, string> = {
				wK: 'K',
				wQ: 'Q',
				wR: 'R',
				wB: 'B',
				wN: 'N',
				wP: '',
				bK: 'K',
				bQ: 'Q',
				bR: 'R',
				bB: 'B',
				bN: 'N',
				bP: '',
			}

			const files = 'abcdefgh'
			const ranks = '87654321'

			if (!move.piece) return ''

			const pieceSymbol = pieceSymbols[move.piece]
			const fromFile = files[move.from[1]]
			const fromRank = ranks[move.from[0]]
			const toFile = files[move.to[1]]
			const toRank = ranks[move.to[0]]

			const capture = move.capturedPiece ? 'x' : ''

			return `${pieceSymbol}${fromFile}${fromRank}${capture}${toFile}${toRank}`
		},

		canMovePiece(piece: PieceType): boolean {
			if (!piece) return false
			const pieceColor = piece[0] === 'w' ? 'white' : 'black'
			return pieceColor === this.currentTurn
		},
	},
})
