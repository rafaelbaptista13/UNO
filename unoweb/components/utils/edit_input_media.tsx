// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Image from "next/image";

// import the icons you need
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Loading from "./loading";

export default function EditInputMedia({
  mediaSrc,
  submitted_media_type,
  setSubmittedMediaType,
  setFile,
  setMediaSrc,
  setEmptyMedia,
}: {
  mediaSrc: string;
  submitted_media_type: string;
  setSubmittedMediaType: (value: React.SetStateAction<string | null>) => void;
  setFile: (value: React.SetStateAction<File | null>) => void;
  setMediaSrc: (value: React.SetStateAction<string>) => void;
  setEmptyMedia: (value: React.SetStateAction<boolean>) => void;
}) {
  return (
    <div className="form-group mb-2">
      <label className="mb-2 primary-text" htmlFor="media">
        {"Ficheiro"}
      </label>
      <br />

      {mediaSrc !== "" && (
        <>
          {submitted_media_type?.split("/")[0] === "video" && (
            <video
              id="media"
              src={mediaSrc}
              width={320}
              height={240}
              controls
            />
          )}
          {submitted_media_type?.split("/")[0] === "image" && (
            <Image
              id="media"
              src={mediaSrc}
              width={320}
              height={240}
              alt={"Imagem submetida"}
            />
          )}
          {submitted_media_type?.split("/")[0] === "audio" && (
            <audio id="media" src={mediaSrc} controls />
          )}
          <br />
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSubmittedMediaType(null);
              setFile(null);
              setMediaSrc("");
              setEmptyMedia(true);
            }}
          >
            <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon> Remover mídia
          </button>
        </>
      )}
      {mediaSrc === "" && <Loading />}
    </div>
  );
}
