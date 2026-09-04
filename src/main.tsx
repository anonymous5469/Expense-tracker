import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const savedTheme = localStorage.getItem("fintrack-theme")
const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches
const shouldUseDark = savedTheme === "dark" || (savedTheme !== "light" && !prefersLight)
document.documentElement.classList.toggle("dark", shouldUseDark)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
