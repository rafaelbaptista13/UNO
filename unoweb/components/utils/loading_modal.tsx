import React from "react";
import Modal from "react-bootstrap/Modal";
import Loading from "./loading";

export default function LoadingModal() {
  return (
    <Modal
      show={true}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body style={{ padding: "50px" }}>
        <Loading />
      </Modal.Body>
    </Modal>
  );
}
