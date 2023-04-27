import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import styled from "styled-components";
import { ActiveClassState } from "../../../redux/features/active_class";
import Image from "next/image";
import SupportMaterialsService from "../../../services/supportmaterials.service";
import Link from "next/link";

const CardDiv = styled.div`
  position: relative;
`;

export default function MaterialForm({
  setIsLoading,
  setErrorMessage,
  setSuccessMessage,
}: {
  setIsLoading: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
  setSuccessMessage: (value: string) => void;
}) {
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mediaSrc, setMediaSrc] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile !== null) {
      setFile(selectedFile);
      const src = URL.createObjectURL(selectedFile);
      setMediaSrc(src);
    }
  };

  const createNewSupportMaterial = async () => {
    setIsLoading(true);

    const new_material_response = await SupportMaterialsService.createMaterial(
      class_id,
      title,
      file,
      description
    );

    setIsLoading(false);

    if (new_material_response.error) {
      // An error occured
      setErrorMessage(
        "Aconteceu um erro ao criar o material de apoio. Por favor tente novamente."
      );
    } else {
      // Activity created successfully
      setSuccessMessage(
        "O material de apoio " + title + " foi criado com sucesso!"
      );
    }
  };

  return (
    <>
      <div className="row g-3 mt-2 mb-4">
        <CardDiv className="container p-3 bg-white shadow-sm rounded">
          <div className="row">
            <div className="form-group mb-2">
              <label className="mb-2 primary-text" htmlFor="title_input">
                Título
              </label>
              <input
                type="text"
                className="form-control"
                id="title_input"
                maxLength={250}
                placeholder="Insira um título"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </div>
            <div className="form-group mb-2">
              <label className="mb-2 primary-text" htmlFor="video_input">
                {"Ficheiro (vídeo, imagem ou áudio)"}
              </label>
              <input
                type="file"
                className="form-control"
                id="video_input"
                onChange={handleFileChange}
                accept="audio/*,video/*,image/*"
              />
              {file && <p>Ficheiro submetido: {file.name}</p>}
              {file?.type.split("/")[0] === "video" && (
                <video src={mediaSrc} width={320} height={240} controls />
              )}
              {file?.type.split("/")[0] === "image" && (
                <Image
                  src={mediaSrc}
                  width={320}
                  height={240}
                  alt={"Imagem submetida"}
                />
              )}
              {file?.type.split("/")[0] === "audio" && (
                <audio src={mediaSrc} controls />
              )}
            </div>
            <div className="form-group mb-2">
              <label className="mb-2 primary-text" htmlFor="description_input">
                {"Descrição (Opcional)"}
              </label>
              <textarea
                className="form-control"
                id="description_input"
                rows={3}
                maxLength={250}
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              ></textarea>
            </div>
          </div>
        </CardDiv>
      </div>
      <div className="row g-3 my-2">
        <div className="col gap-3 d-flex justify-content-end">
          <button
            className="btn btn-success"
            onClick={createNewSupportMaterial}
          >
            Concluir
          </button>
          <Link href={"/contents/supportmaterials"}>
            <button
              className="btn btn-danger"
            >
              Cancelar
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
