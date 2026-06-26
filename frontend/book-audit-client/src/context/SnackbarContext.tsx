import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { Alert, Snackbar } from '@mui/material'

type Severity = 'success' | 'error' | 'info' | 'warning'

interface SnackbarState {
  message: string
  severity: Severity
  open: boolean
}

interface SnackbarContextType {
  showMessage: (message: string, severity?: Severity) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined)

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SnackbarState>({
    message: '',
    severity: 'info',
    open: false
  })

  const showMessage = useCallback((message: string, severity: Severity = 'info') => {
    setState({ message, severity, open: true })
  }, [])

  const handleClose = () => {
    setState((prev) => ({ ...prev, open: false }))
  }

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={state.severity} onClose={handleClose}>
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider')
  }
  return context
}