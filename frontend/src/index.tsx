import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout from './components/Layout/Layout'
import './styles/globals.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Layout />
  </React.StrictMode>,
)