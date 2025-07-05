function CloudBackground() {
  // Cloud clusters for better visual impact
  const cloudClusters = [
    // Top-left cluster
    { id: 1, src: '/ui/background/Cloud 1.png', top: '8%', left: '5%', size: 140, delay: 0 },
    { id: 2, src: '/ui/background/Cloud 3.png', top: '12%', left: '12%', size: 120, delay: 1 },
    { id: 3, src: '/ui/background/Cloud 5.png', top: '18%', left: '8%', size: 110, delay: 2 },
    
    // Top-right cluster
    { id: 4, src: '/ui/background/Cloud 7.png', top: '5%', left: '75%', size: 130, delay: 0.5 },
    { id: 5, src: '/ui/background/Cloud 9.png', top: '15%', left: '80%', size: 150, delay: 1.5 },
    { id: 6, src: '/ui/background/Cloud 11.png', top: '22%', left: '85%', size: 100, delay: 2.5 },
    
    // Bottom-left cluster
    { id: 7, src: '/ui/background/Cloud 13.png', top: '70%', left: '10%', size: 160, delay: 1 },
    { id: 8, src: '/ui/background/Cloud 15.png', top: '75%', left: '5%', size: 135, delay: 2 },
    { id: 9, src: '/ui/background/Cloud 17.png', top: '80%', left: '15%', size: 125, delay: 3 },
    
    // Bottom-right cluster
    { id: 10, src: '/ui/background/Cloud 19.png', top: '65%', left: '78%', size: 145, delay: 0.8 },
    { id: 11, src: '/ui/background/Cloud 2.png', top: '72%', left: '85%', size: 115, delay: 2.2 },
    { id: 12, src: '/ui/background/Cloud 4.png', top: '78%', left: '82%', size: 130, delay: 1.8 },
    
    // Center accent clouds (smaller, more subtle)
    { id: 13, src: '/ui/background/Cloud 6.png', top: '40%', left: '45%', size: 90, delay: 3 },
    { id: 14, src: '/ui/background/Cloud 8.png', top: '35%', left: '55%', size: 85, delay: 4 },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {cloudClusters.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute drift-animation"
          style={{
            top: cloud.top,
            left: cloud.left,
            animationDelay: `${cloud.delay}s`,
            animationDuration: `${30 + cloud.id * 3}s`,
          }}
        >
          <img
            src={cloud.src}
            alt=""
            className="float-animation"
            style={{
              width: `${cloud.size}px`,
              height: 'auto',
              animationDelay: `${cloud.delay * 0.5}s`,
              animationDuration: `${15 + cloud.id}s`,
              imageRendering: 'pixelated',
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default CloudBackground