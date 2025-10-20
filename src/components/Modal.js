import React from "react";
import "../../src/styles/layout/Modal.css";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-rootOverlay" onClick={onClose}>
      <div
        className="modal-rootContent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-rootBody">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
