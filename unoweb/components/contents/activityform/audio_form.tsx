import React from "react";

export default function AudioForm() {
  return (
    <>
      <div className="form-group mb-2">
        <label className="mb-2 primary-text" htmlFor="title_input">
          Título
        </label>
        <input
          type="text"
          className="form-control"
          id="title_input"
          placeholder="Insira um título"
        />
      </div>
      <div className="form-group mb-2">
        <label className="mb-2 primary-text" htmlFor="audio_input">
          Áudio
        </label>
        <input type="file" className="form-control" id="audio_input" />
      </div>
      <div className="form-group mb-2">
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
