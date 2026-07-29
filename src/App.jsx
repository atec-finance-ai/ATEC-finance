import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Checklist from './pages/Checklist.jsx'
import Admin from './pages/Admin.jsx'
import Print from './pages/Print.jsx'
import History from './pages/History.jsx'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <Nav />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/checklist/:periodId" element={<Checklist />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/print" element={<Print />} />
          <Route path="/print/:periodId" element={<Print />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  )
}
