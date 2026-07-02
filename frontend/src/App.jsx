import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ServerUIProvider } from './context/ServerContext.jsx'
import { useServerStore } from './store/serverStore.js'

export default function App() {
  useEffect(() => {
    useServerStore.getState().fetchServers()
  }, [])

  return (
    <ThemeProvider>
      <ServerUIProvider>
        <RouterProvider router={router} />
      </ServerUIProvider>
    </ThemeProvider>
  )
}
