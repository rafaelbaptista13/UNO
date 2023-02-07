import React, { useState } from "react";

export default function QuestionForm() {
  return (
    <>
      <div className="form-group mb-2">
        <label className="mb-2 primary-text" htmlFor="question_input">
          Pergunta
        </label>
        <input
          type="number"
          className="form-control"
          id="question_input"
          placeholder="Escreva a sua pergunta"
        />
      </div>

      <div className="form-group mb-2 col-md-6">
        <label className="mb-2 primary-text" htmlFor="add_response_input">
          Adicionar resposta
        </label>
        <div className="d-flex">
          <input
            type="text"
            className="form-control"
            id="add_response_input"
            placeholder="Escreva a sua resposta"
          />
          <button className="btn btn-warning ms-2">
            <strong>+</strong>
          </button>
        </div>
      </div>

      <div className="form-group mb-2 col-md-6">
        <label className="mb-2 primary-text">Respostas</label>
        <div className="col border card py-1 mb-1">
          <span className="ms-2 primary-text"><strong>A</strong> - Muito feliz</span>
        </div>
        <div className="col border card py-1 mb-1">
          <span className="ms-2 primary-text"><strong>B</strong> - Feliz</span>
        </div>
      </div>
    </>
  );
}
