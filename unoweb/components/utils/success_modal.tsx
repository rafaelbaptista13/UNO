import React from "react";
import Modal from "react-bootstrap/Modal";
import { ButtonPrimary } from "../../utils/buttons";

interface ISuccessModalProps {
  message: string;
  onHide(): void;
  show: boolean;
}

export default function SuccessModal({
  message,
  onHide,
  show,
}: ISuccessModalProps) {
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
          Operação realizada com sucesso!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <ButtonPrimary onClick={onHide}>Fechar</ButtonPrimary>
      </Modal.Footer>
    </Modal>
  );
}
