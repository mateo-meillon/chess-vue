import { ref, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import type { PieceType } from '../utils/chess'

interface DraggingPiece {
	type: PieceType
	fromRow: number
	fromCol: number
	x: number
	y: number
}

type MovePieceFn = (from: DraggingPiece, toRow: number, toCol: number) => void

export function useChessDrag(boardMatrix: Ref<PieceType[][]>, boardEl: Ref<HTMLElement | null>, cellSize: Ref<number>, movePiece: MovePieceFn) {
	const draggingPiece = ref<DraggingPiece | null>(null)

	function onPieceMouseDown(rowIndex: number, colIndex: number, event: MouseEvent) {
		const type = boardMatrix.value[rowIndex][colIndex]
		if (!type) return
		draggingPiece.value = {
			type,
			fromRow: rowIndex,
			fromCol: colIndex,
			x: event.clientX,
			y: event.clientY,
		}
		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp)
	}

	function onPieceTouchStart(rowIndex: number, colIndex: number, event: TouchEvent) {
		const type = boardMatrix.value[rowIndex][colIndex]
		if (!type) return
		const touch = event.touches[0]
		draggingPiece.value = {
			type,
			fromRow: rowIndex,
			fromCol: colIndex,
			x: touch.clientX,
			y: touch.clientY,
		}
		window.addEventListener('touchmove', onTouchMove)
		window.addEventListener('touchend', onTouchEnd)
	}

	function onMouseMove(event: MouseEvent) {
		if (draggingPiece.value) {
			draggingPiece.value.x = event.clientX
			draggingPiece.value.y = event.clientY
		}
	}

	function onTouchMove(event: TouchEvent) {
		if (draggingPiece.value) {
			const touch = event.touches[0]
			draggingPiece.value.x = touch.clientX
			draggingPiece.value.y = touch.clientY
		}
	}

	function onMouseUp(event: MouseEvent) {
		handleDrop(event.clientX, event.clientY)
		window.removeEventListener('mousemove', onMouseMove)
		window.removeEventListener('mouseup', onMouseUp)
	}

	function onTouchEnd(event: TouchEvent) {
		if (draggingPiece.value) {
			handleDrop(draggingPiece.value.x, draggingPiece.value.y)
		}
		window.removeEventListener('touchmove', onTouchMove)
		window.removeEventListener('touchend', onTouchEnd)
	}

	function handleDrop(x: number, y: number) {
		if (!draggingPiece.value) return
		if (!boardEl.value) {
			draggingPiece.value = null
			return
		}
		const boardRect = boardEl.value.getBoundingClientRect()
		const size = cellSize.value
		const col = Math.floor((x - boardRect.left) / size)
		const row = Math.floor((y - boardRect.top) / size)
		const from = draggingPiece.value
		movePiece(from, row, col)
		draggingPiece.value = null
	}

	onBeforeUnmount(() => {
		window.removeEventListener('mousemove', onMouseMove)
		window.removeEventListener('mouseup', onMouseUp)
		window.removeEventListener('touchmove', onTouchMove)
		window.removeEventListener('touchend', onTouchEnd)
	})

	return {
		draggingPiece,
		onPieceMouseDown,
		onPieceTouchStart,
		onMouseMove,
		onMouseUp,
		onTouchMove,
		onTouchEnd,
		handleDrop,
	}
}
