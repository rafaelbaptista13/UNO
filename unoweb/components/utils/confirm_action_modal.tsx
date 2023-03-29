import React from "react";
import Modal from "react-bootstrap/Modal";

interface IConfirmActionModalProps {
  message: string;
  onHide(): void;
  show: boolean;
  confirmAction: () => void;
}

export default function ConfirmActionModal({
  message,
  onHide,
  show,
  confirmAction,
}: IConfirmActionModalProps) {
  return (
    <Modal
      onHide={onHide}
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Tem a certeza?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-success" onClick={confirmAction}>
          Confirmar
        </button>
        <button className="btn btn-danger" onClick={onHide}>
          Cancelar
        </button>
      </Modal.Footer>
    </Modal>
  );
}
