import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import router from './App'
import { RouterProvider } from 'react-router'
import { SemaforoProvider } from './contexts/SemaforoContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SemaforoProvider>
      <RouterProvider router={router} />
    </SemaforoProvider>
  </StrictMode>,
)
