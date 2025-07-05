function CloudBackground() {
  // Larger, more prominent clouds
  const cloudClusters = [
    // Top-left cluster
    { id: 1, src: '/ui/background/Cloud 1.png', top: '5%', left: '0%', size: 280, delay: 0 },
    { id: 2, src: '/ui/background/Cloud 3.png', top: '10%', left: '8%', size: 240, delay: 1 },
    { id: 3, src: '/ui/background/Cloud 5.png', top: '15%', left: '3%', size: 220, delay: 2 },
    
    // Top-right cluster
    { id: 4, src: '/ui/background/Cloud 7.png', top: '2%', left: '70%', size: 260, delay: 0.5 },
    { id: 5, src: '/ui/background/Cloud 9.png', top: '12%', left: '75%', size: 300, delay: 1.5 },
    { id: 6, src: '/ui/background/Cloud 11.png', top: '20%', left: '80%', size: 200, delay: 2.5 },
    
    // Bottom-left cluster
    { id: 7, src: '/ui/background/Cloud 13.png', top: '65%', left: '5%', size: 320, delay: 1 },
    { id: 8, src: '/ui/background/Cloud 15.png', top: '72%', left: '0%', size: 270, delay: 2 },
    { id: 9, src: '/ui/background/Cloud 17.png', top: '78%', left: '10%', size: 250, delay: 3 },
    
    // Bottom-right cluster
    { id: 10, src: '/ui/background/Cloud 19.png', top: '60%', left: '73%', size: 290, delay: 0.8 },
    { id: 11, src: '/ui/background/Cloud 2.png', top: '70%', left: '80%', size: 230, delay: 2.2 },
    { id: 12, src: '/ui/background/Cloud 4.png', top: '76%', left: '77%', size: 260, delay: 1.8 },
    
    // Center accent clouds (larger and more noticeable)
    { id: 13, src: '/ui/background/Cloud 6.png', top: '35%', left: '40%', size: 180, delay: 3 },
    { id: 14, src: '/ui/background/Cloud 8.png', top: '30%', left: '50%', size: 170, delay: 4 },
    { id: 15, src: '/ui/background/Cloud 10.png', top: '45%', left: '30%', size: 190, delay: 1.2 },
    { id: 16, src: '/ui/background/Cloud 12.png', top: '40%', left: '60%', size: 160, delay: 3.5 },
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
            animationDuration: `${15 + cloud.id * 2}s`,
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
              animationDuration: `${8 + cloud.id}s`,
              imageRendering: 'pixelated',
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default CloudBackground