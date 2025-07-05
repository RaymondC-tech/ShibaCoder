function CloudBackground() {
  // Cloud configurations with positions and animations
  const clouds = [
    { id: 1, src: '/Cloud%201.png', top: '10%', left: '5%', size: 120, delay: 0 },
    { id: 2, src: '/Cloud%203.png', top: '15%', left: '75%', size: 140, delay: 2 },
    { id: 3, src: '/Cloud%205.png', top: '60%', left: '85%', size: 130, delay: 1 },
    { id: 4, src: '/Cloud%207.png', top: '70%', left: '10%', size: 110, delay: 3 },
    { id: 5, src: '/Cloud%209.png', top: '40%', left: '90%', size: 150, delay: 1.5 },
    { id: 6, src: '/Cloud%2011.png', top: '5%', left: '40%', size: 100, delay: 2.5 },
    { id: 7, src: '/Cloud%2013.png', top: '80%', left: '50%', size: 120, delay: 0.5 },
    { id: 8, src: '/Cloud%2015.png', top: '25%', left: '15%', size: 135, delay: 1.8 },
    { id: 9, src: '/Cloud%2017.png', top: '75%', left: '30%', size: 160, delay: 2.3 },
    { id: 10, src: '/Cloud%2019.png', top: '50%', left: '60%', size: 125, delay: 0.8 },
    { id: 11, src: '/Cloud%202.png', top: '35%', left: '70%', size: 115, delay: 3.2 },
    { id: 12, src: '/Cloud%204.png', top: '85%', left: '80%', size: 105, delay: 1.2 },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {clouds.map((cloud) => (
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
            className="opacity-70 float-animation"
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