export type PlayerColor = 'white' | 'black'
export type CellColor = 'light' | 'dark'
export type PieceType = 'wK' | 'wQ' | 'wR' | 'wB' | 'wN' | 'wP' | 'bK' | 'bQ' | 'bR' | 'bB' | 'bN' | 'bP' | null

export function createInitialBoard(): PieceType[][] {
	return [
		['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
		['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
		['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
	]
}

export function getCellColor(rowIndex: number, cellIndex: number, color: PlayerColor): CellColor {
	const isWhite = color === 'white'
	const row = isWhite ? 7 - rowIndex : rowIndex
	const col = isWhite ? cellIndex : 7 - cellIndex
	return (row + col) % 2 === 1 ? 'light' : 'dark'
}

export function isOppositeColor(pieceA: PieceType, pieceB: PieceType): boolean {
	if (!pieceA || !pieceB) return false
	return pieceA[0] !== pieceB[0]
}
