import { Link } from 'react-router-dom'
import { Browser } from 'react-kawaii'
import CloudBackground from './CloudBackground'
import ShibaSprite from './ShibaSprite'
import Navbar from './Navbar'

function About() {
  return (
    <div className="min-h-screen bg-shiba-bg flex flex-col relative">
      <CloudBackground />
      <ShibaSprite behavior="wander" />
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        <div className="nes-container with-title is-centered bg-white max-w-2xl relative">
          <p className="title">About ShibaCoder</p>
          
          {/* Shiba question image positioned at top center */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 z-20">
            <img 
              src="/shibaquestion.svg" 
              alt="Curious Shiba Inu" 
              className="w-40 h-auto"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          
          <div className="space-y-6 pt-24">
            
            <div className="space-y-4 text-sm">
              <div className="nes-container is-rounded">
                <h3 className="font-bold mb-2">What is ShibaCoder?</h3>
                <p>ShibaCoder is a pixel-perfect coding challenge platform where developers can compete in real-time programming battles! Test your skills, learn new algorithms, and have fun with friends.</p>
              </div>
              
              <div className="nes-container is-rounded">
                <h3 className="font-bold mb-2">Features</h3>
                <ul className="space-y-1">
                  <li>• Real-time multiplayer coding battles</li>
                  <li>• Various difficulty levels and challenges</li>
                  <li>• Custom lobby creation and room codes</li>
                </ul>
              </div>
              
              <div className="nes-container is-rounded">
                <h3 className="font-bold mb-2">How to Play</h3>
                <ol className="space-y-1">
                  <li>1. Create or join a lobby</li>
                  <li>2. Wait for your opponent</li>
                  <li>3. Solve coding challenges as fast as you can</li>
                  <li>4. First to complete wins!</li>
                </ol>
              </div>
            </div>
            
            <div className="text-center">
              <Link to="/">
                <button type="button" className="nes-btn is-primary">
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About