const Modal = ({open, onClose, children}) => {
    return (
        <div
            id="modal"
            onClick={onClose}
            className={`fixed inset-0 z-50 flex justify-start items-center transition-colors
            ${open ? "visible bg-black/20" : "invisible"}`}
        >
            {/* modal */}
            <div
                onClick={e => e.stopPropagation()}
                className={`bg-color-primary-light rounded-[20px] border-8 border-[#4f959d] shadow p-6 transition-all
                max-h-[80vh] overflow-y-auto
                ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}`}
                style={{width: '28%', maxWidth: '', height: '50%'}} // ancho máximo opcional
            >
                {children}
            </div>
        </div>
    );
};

export default Modal;