import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Browser } from 'react-kawaii'
import CloudBackground from './CloudBackground'
import ShibaSprite from './ShibaSprite'
import Navbar from './Navbar'
import './Navbar.css' // For the glow effect

function FrontPage() {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#EBC697' }}>
      <CloudBackground />
      <ShibaSprite behavior="follow" />
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        <div className="nes-container with-title is-centered bg-white max-w-md w-full">
          <p className="title">ShibaCoder</p>
          
          <div className="flex flex-col items-center space-y-6">
            <img src="/shibaface.svg" alt="ShibaCoder" className="w-32 h-32" />
            
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold">Welcome to ShibaCoder!</h2>
              <p className="text-sm text-gray-600">
                Challenge your friends to epic coding battles!
              </p>
            </div>
            
            <div className="flex flex-col space-y-3 w-full">
              <Link to="/game" className="w-full">
                <button type="button" className="nes-btn is-primary w-full">
                  Enter Game Lobby
                </button>
              </Link>
              
              <Link to="/daily" className="w-full">
                <button type="button" className="nes-btn is-warning w-full daily-glow">
                  ✨ Daily Challenge ✨
                </button>
              </Link>
              
              <Link to="/about" className="w-full">
                <button type="button" className="nes-btn w-full">
                  About
                </button>
              </Link>
            </div>
            
            <div className="text-xs text-center text-gray-500 space-y-1">
              <p>Pixel perfect coding challenges</p>
              <p>Real-time multiplayer battles</p>
              <p>Much wow, such code!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FrontPage