import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // 👈 Ye line zaroori hai
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />  {/* 👈 Yahan <App /> hona chahiye, <RequestBlood /> NAHI */}
  </React.StrictMode>,
)