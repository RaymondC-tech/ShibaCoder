import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FrontPage from './components/FrontPage'
import GameLobby from './components/GameLobby'
import About from './components/About'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/game" element={<GameLobby />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  )
}

export default App