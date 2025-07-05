function Navbar() {
  return (
    <nav className="bg-shiba-bg border-b-4 border-amber-700 relative z-20">
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.svg" 
            alt="ShibaCoder Logo" 
            className="h-16 w-16"
            style={{ imageRendering: 'auto', objectFit: 'contain' }}
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-bold text-amber-900">ShibaCoder</h1>
            <span className="text-xs text-amber-700 mx-1">×</span>
            <span className="text-xs text-amber-700">hack404</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            className="nes-btn is-normal text-xs px-4 py-1"
            style={{ height: '32px' }}
          >
            About
          </button>
          <button 
            type="button" 
            className="nes-btn is-normal text-xs px-4 py-1"
            style={{ height: '32px' }}
          >
            Rules
          </button>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nes-btn is-normal text-xs px-4 py-1 inline-flex items-center"
            style={{ height: '32px' }}
          >
            <i className="nes-icon github is-small mr-2"></i>
            Code
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar