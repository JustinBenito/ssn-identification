import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast';
import './index.css'
import Navbar from './navbar.jsx'
import Sidebar from './sidebar.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Navbar />
    <Sidebar />
    <Toaster />
  </React.StrictMode>,
)
