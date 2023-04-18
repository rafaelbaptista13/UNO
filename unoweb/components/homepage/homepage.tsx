import Image from "next/image";
import React from "react";

import styled from "styled-components";
import getBasePath from "../utils/basePath";

import PageCard from "../utils/page_card";

const ImageResponsiveDiv = styled.div`
  height: 100px;
  position: relative;
`;

export default function HomePage() {
  const basePath = getBasePath();

  return (
    <div className="container px-4 mt-5">
      <div className="row mt-5 mb-5">
        <div className="col-xl-2"></div>
        <div className="col-xl-8">
          <ImageResponsiveDiv>
            <Image
              fill
              sizes="100"
              id="header-logo"
              src={ basePath + "/img/logo-no-background.png"}
              alt="SportsStats logo"
              style={{ objectFit: "contain" }}
            />
          </ImageResponsiveDiv>
        </div>
        <div className="col-xl-2"></div>
      </div>

      <div className="row g-3 my-2">
        <div className="col-lg-6 col-xl-4">
          <PageCard
            header="Conteúdos"
            text="Gerencie os conteúdos e exercícios nos grupos de atividades e materiais de apoio. "
            path="/contents"
          />
        </div>

        <div className="col-lg-6 col-xl-4">
          <PageCard
            header="Click"
            text="Crie uma pergunta para os seus alunos e visualize as respostas."
            path="/click"
          />
        </div>

        <div className="col-lg-6 col-xl-4">
          <PageCard
            header="Vídeos"
            text="Visualize e avalie os vídeos que os seus alunos submeteram."
            path="/videos"
          />
        </div>

        <div className="col-lg-6 col-xl-4">
          <PageCard
            header="Progresso"
            text="Visualize o progresso dos seus alunos na aprendizagem."
            path="/progress"
          />
        </div>

        <div className="col-lg-6 col-xl-4">
          <PageCard
            header="Mensagens"
            text="Envie mensagens no chat global da turma."
            path="/messages"
          />
        </div>

        <div className="col-lg-6 col-xl-4">
          <PageCard
            header="Notas"
            text="Escreva notas sobre os seus alunos sempre que necessário."
            path="/notes"
          />
        </div>
      </div>
    </div>
  );
}
