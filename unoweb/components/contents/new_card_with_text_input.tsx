import styled from "styled-components";
import { useState } from "react";

const CardDiv = styled.div`
  position: relative;
`;

export default function NewCardWithTextInput({
  confirm,
  cancel,
}: {
  confirm: (name: string) => void;
  cancel: () => void;
}) {
  const [name, setName] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <CardDiv className="p-3 bg-white shadow-sm rounded d-sm-flex justify-content-sm-between">
      <input
        type="text"
        className="form-control me-3"
        id="name_input"
        placeholder="Nome"
        value={name}
        onChange={handleChange}
        required
      />
      <div className="d-flex justify-content-center d-grid gap-3">
        <div>
          <button
            className="btn btn-success"
            onClick={() => {
              confirm(name);
              cancel();
            }}
          >
            Confirmar
          </button>
        </div>
        <div>
          <button
            className="btn btn-danger"
            onClick={() => {
              cancel();
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </CardDiv>
  );
}
