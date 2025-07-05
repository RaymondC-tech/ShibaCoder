function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full pt-8">
        <div className="nes-container with-title is-centered bg-white max-h-[90vh] overflow-y-auto pixel-shadow">
          {title && <p className="title bg-white px-4">{title}</p>}
          <button
            type="button"
            className="absolute top-4 right-4 nes-btn is-error text-xs"
            onClick={onClose}
            style={{ width: '40px', height: '40px', padding: '4px' }}
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal