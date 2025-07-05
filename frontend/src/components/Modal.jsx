function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full pt-8">
        {title && (
          <h2 className="nes-text text-center mb-4 bg-white px-4 py-2 mx-auto inline-block text-black">
            {title}
          </h2>
        )}
        <div className="nes-container is-centered bg-white max-h-[90vh] overflow-y-auto pixel-shadow relative">
          <button
            type="button"
            className="absolute top-2 right-2 nes-btn is-error text-xs"
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