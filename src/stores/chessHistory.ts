import { defineStore } from 'pinia'
import type { PieceType } from '../utils/chess'
import type { PlayerColor } from '../utils/chess'
import { createInitialBoard } from '../utils/chess'
import { Chess } from 'chess.js'

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
		viewingHistory: false,
		chess: new Chess(),
	}),

	getters: {
		lastMove: (state) => state.moves[state.currentMoveIndex] || null,
		moveHistory: (state) => state.moves,
		isWhiteTurn: (state) => state.currentTurn === 'white',
		currentPosition: (state) => {
			const board = createInitialBoard()
			const history = state.chess.history({ verbose: true })

			// Apply all moves up to the current index
			for (let i = 0; i <= state.currentMoveIndex; i++) {
				const move = state.moves[i]
				if (!move) continue

				board[move.to[0]][move.to[1]] = move.piece
				board[move.from[0]][move.from[1]] = null
			}

			return board
		},
		legalMoves: (state) => {
			const moves = state.chess.moves({ verbose: true })
			return moves.map((move) => ({
				from: [8 - parseInt(move.from[1]), move.from.charCodeAt(0) - 97] as [number, number],
				to: [8 - parseInt(move.to[1]), move.to.charCodeAt(0) - 97] as [number, number],
			}))
		},
		isGameOver: (state) => state.chess.isGameOver(),
	},

	actions: {
		addMove(move: ChessMove) {
			// Convert our move format to chess.js format
			const fromFile = String.fromCharCode(97 + move.from[1])
			const fromRank = 8 - move.from[0]
			const toFile = String.fromCharCode(97 + move.to[1])
			const toRank = 8 - move.to[0]
			const moveStr = `${fromFile}${fromRank}${toFile}${toRank}`

			try {
				// Try to make the move in chess.js
				this.chess.move(moveStr)

				// If successful, update our state
				if (this.currentMoveIndex < this.moves.length - 1) {
					this.moves = this.moves.slice(0, this.currentMoveIndex + 1)
				}
				this.moves.push(move)
				this.currentMoveIndex = this.moves.length - 1
				this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white'
				this.viewingHistory = false
			} catch (e) {
				console.error('Invalid move:', e)
				return false
			}
			return true
		},

		viewPosition(moveIndex: number) {
			if (moveIndex < -1 || moveIndex >= this.moves.length) return

			// Reset the chess.js board
			this.chess.reset()

			// Replay moves up to the desired position
			for (let i = 0; i <= moveIndex; i++) {
				const move = this.moves[i]
				if (!move) continue

				const fromFile = String.fromCharCode(97 + move.from[1])
				const fromRank = 8 - move.from[0]
				const toFile = String.fromCharCode(97 + move.to[1])
				const toRank = 8 - move.to[0]
				const moveStr = `${fromFile}${fromRank}${toFile}${toRank}`

				this.chess.move(moveStr)
			}

			this.currentMoveIndex = moveIndex
			this.viewingHistory = true
			this.currentTurn = moveIndex % 2 === 0 ? 'black' : 'white'
		},

		returnToCurrent() {
			this.chess.reset()
			// Replay all moves
			for (const move of this.moves) {
				const fromFile = String.fromCharCode(97 + move.from[1])
				const fromRank = 8 - move.from[0]
				const toFile = String.fromCharCode(97 + move.to[1])
				const toRank = 8 - move.to[0]
				const moveStr = `${fromFile}${fromRank}${toFile}${toRank}`

				this.chess.move(moveStr)
			}

			this.currentMoveIndex = this.moves.length - 1
			this.viewingHistory = false
			this.currentTurn = this.moves.length % 2 === 0 ? 'white' : 'black'
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
			return pieceColor === this.currentTurn && !this.viewingHistory
		},

		isLegalMove(from: [number, number], to: [number, number]): boolean {
			const fromFile = String.fromCharCode(97 + from[1])
			const fromRank = 8 - from[0]
			const toFile = String.fromCharCode(97 + to[1])
			const toRank = 8 - to[0]
			const moveStr = `${fromFile}${fromRank}${toFile}${toRank}`

			try {
				const move = this.chess.move(moveStr)
				if (move) {
					this.chess.undo()
					return true
				}
			} catch (e) {
				return false
			}
			return false
		},
	},
})
