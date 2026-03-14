import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string
        const res = await fetch(url)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        return res.json()
      },
      staleTime: 5000,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-gray-800 text-white border border-gray-700',
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
