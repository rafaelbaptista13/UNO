import React, { useState } from "react";

export default function GameForm() {
  const [selectedMode, setSelectedMode] = useState("identify");

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMode(event.target.value);
  };

  return (
    <>
      <div className="form-group col-xl-4">
        <label className="mb-2 primary-text" htmlFor="game_mode_input">
          Modo de jogo
        </label>
        <select
          className="form-select mb-2"
          id="game_mode_input"
          value={selectedMode}
          onChange={handleChange}
        >
          <option value={"identify"}>Identificar</option>
          <option value={"reproduce"}>Reproduzir</option>
          <option value={"build"}>Construir</option>
        </select>
      </div>

      {selectedMode === "build" && (
        <div className="form-group mb-2 col-xl-4">
          <label className="mb-2 primary-text" htmlFor="sequence_length_input">
            Comprimento da sequência
          </label>
          <input
            type="number"
            className="form-control"
            id="sequence_length_input"
            placeholder="Defina o comprimento da sequência de notas"
          />
        </div>
      )}

      <div className="mb-2 col-xl-6">
        <label className="mb-2 primary-text" htmlFor="description_input">
          {(selectedMode === "identify" ||
            selectedMode === "reproduce") && "Sequência de notas"}
          {selectedMode === "build" && "Notas disponíveis"}
        </label>
        <div className="container g-1 text-center">
          <div className="row mb-2">
            <div className="col-4 col-sm-2 mb-2 align-self-end">
              <label className="primary-text" htmlFor="note_input">
                Nota
              </label>
              <input type={"text"} id={"note_input"} className="form-control" />
            </div>

            <div className="col-8 col-sm-4 mb-2">
              <div className="row primary-text">
                <label>Violino</label>
              </div>
              <div className="row">
                <div className="col">
                  <label className="primary-text" htmlFor="string_violin_input">
                    Corda
                  </label>
                  <input
                    type={"text"}
                    id={"string_violin_input"}
                    className="form-control"
                  />
                </div>
                <div className="col">
                  <label className="primary-text" htmlFor="finger_violin_input">
                    Dedo
                  </label>
                  <input
                    type={"text"}
                    id={"finger_violin_input"}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="col-8 col-sm-4 mb-2">
              <div className="row primary-text">
                <label>Viola</label>
              </div>
              <div className="row">
                <div className="col">
                  <label className="primary-text" htmlFor="string_viola_input">
                    Corda
                  </label>
                  <input
                    type={"text"}
                    id={"string_viola_input"}
                    className="form-control"
                  />
                </div>
                <div className="col">
                  <label className="primary-text" htmlFor="finger_viola_input">
                    Dedo
                  </label>
                  <input
                    type={"text"}
                    id={"finger_viola_input"}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="col-4 col-sm-2 mb-2 d-flex align-items-end justify-content-center">
              <button className="btn btn-warning">
                <strong>+</strong>
              </button>
            </div>
          </div>
        </div>
        <div className="table-responsive card" id="description_input">
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th className="primary-text" rowSpan={2}>
                  #
                </th>
                <th className="primary-text" rowSpan={2}>
                  Nota
                </th>
                <th className="primary-text" colSpan={2}>
                  Violino
                </th>
                <th className="primary-text" colSpan={2}>
                  Viola
                </th>
              </tr>
              <tr>
                <th className="primary-text" scope="col">
                  Corda
                </th>
                <th className="primary-text" scope="col">
                  Dedo
                </th>
                <th className="primary-text" scope="col">
                  Corda
                </th>
                <th className="primary-text" scope="col">
                  Dedo
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="primary-text" scope="row">
                  1
                </th>
                <td className="primary-text">Lá</td>
                <td className="primary-text">2</td>
                <td className="primary-text">3</td>
                <td className="primary-text">1</td>
                <td className="primary-text">2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="form-group mb-2 col-xl-6">
        <label className="mb-2 primary-text" htmlFor="description_input">
          {"Descrição (Opcional)"}
        </label>
        <textarea
          className="form-control"
          id="description_input"
          rows={3}
        ></textarea>
      </div>
    </>
  );
}
