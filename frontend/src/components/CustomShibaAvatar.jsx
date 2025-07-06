import { getUserShibaStyle, getShibaStyleById } from '../utils/shibaCustomization'

function CustomShibaAvatar({ size = 50, className = '', style = {}, colorId = null }) {
  // If colorId is provided, use that specific color, otherwise use user's saved customization
  const shibaStyle = colorId ? getShibaStyleById(colorId) : getUserShibaStyle()
  
  return (
    <img 
      src="/shibaface.svg" 
      alt="Shiba Avatar" 
      className={`${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: 'pixelated',
        ...shibaStyle,
        ...style
      }}
    />
  )
}

export default CustomShibaAvatar