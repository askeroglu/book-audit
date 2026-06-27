import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import type { DialogProps } from '@mui/material/Dialog'
import type { DialogTitleProps } from '@mui/material/DialogTitle'
import type { PaperProps } from '@mui/material/Paper'
import CloseIcon from '@mui/icons-material/Close'

interface DragContextValue {
  handleId: string
  paperRef: React.MutableRefObject<HTMLDivElement | null>
  startDrag: (event: React.MouseEvent) => void
}

const DragContext = createContext<DragContextValue | null>(null)

let dialogCounter = 0

const DraggablePaper = forwardRef<HTMLDivElement, PaperProps>(function DraggablePaper(props, forwardedRef) {
  const drag = useContext(DragContext)

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (drag) {
        drag.paperRef.current = node
      }
      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }
    },
    [drag, forwardedRef]
  )

  return <Paper ref={setRef} {...props} />
})

export function DraggableDialog({ children, ...props }: DialogProps) {
  const handleId = useMemo(() => `draggable-dialog-title-${++dialogCounter}`, [])
  const paperRef = useRef<HTMLDivElement | null>(null)
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  })

  const startDrag = (event: React.MouseEvent) => {
    const paper = paperRef.current
    if (!paper || dragState.current.dragging) return

    dragState.current.dragging = true
    dragState.current.startX = event.clientX
    dragState.current.startY = event.clientY

    const onMouseMove = (e: MouseEvent) => {
      if (!dragState.current.dragging) return
      const deltaX = e.clientX - dragState.current.startX
      const deltaY = e.clientY - dragState.current.startY
      const x = dragState.current.offsetX + deltaX
      const y = dragState.current.offsetY + deltaY
      paper.style.transform = `translate3d(${x}px, ${y}px, 0)`
      paper.style.transition = 'none'
      paper.style.willChange = 'transform'
    }

    const onMouseUp = (e: MouseEvent) => {
      dragState.current.dragging = false
      dragState.current.offsetX += e.clientX - dragState.current.startX
      dragState.current.offsetY += e.clientY - dragState.current.startY
      paper.style.willChange = 'auto'
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  useEffect(() => {
    return () => {
      dragState.current.dragging = false
    }
  }, [])

  return (
    <DragContext.Provider value={{ handleId, paperRef, startDrag }}>
      <Dialog
        {...props}
        PaperComponent={DraggablePaper}
        transitionDuration={0}
        keepMounted={false}
        disableRestoreFocus
      >
        {children}
      </Dialog>
    </DragContext.Provider>
  )
}

export function DraggableDialogTitle({
  children,
  onClose,
  ...props
}: DialogTitleProps & { onClose?: () => void }) {
  const drag = useContext(DragContext)
  if (!drag) {
    return <DialogTitle {...props}>{children}</DialogTitle>
  }

  return (
    <DialogTitle
      {...props}
      id={drag.handleId}
      onMouseDown={(event) => {
        drag.startDrag(event)
        props.onMouseDown?.(event)
      }}
      style={{ cursor: 'move', userSelect: 'none', position: 'relative', paddingRight: 48, ...props.style }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          borderTopLeftRadius: 'inherit',
          borderTopRightRadius: 'inherit',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 100%)',
          pointerEvents: 'none'
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>{children}</Box>
        {onClose && (
          <IconButton onClick={onClose} size="small" sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
    </DialogTitle>
  )
}