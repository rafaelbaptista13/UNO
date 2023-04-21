import Head from "next/head";

import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { useSelector } from "react-redux";
import EditMaterialForm from "../../../../components/contents/supportmaterials/edit_material_form";
import { RootState } from "../../../../redux/store";
import { ActiveClassState } from "../../../../redux/features/active_class";
import SupportMaterialsService from "../../../../services/supportmaterials.service";
import Loading from "../../../../components/utils/loading";
import PageHeader from "../../../../components/utils/page_header";
import ErrorCard from "../../../../components/utils/error_card";
import ErrorModal from "../../../../components/utils/error_modal";
import SuccessModal from "../../../../components/utils/success_modal";
import LoadingModal from "../../../../components/utils/loading_modal";

interface SupportMaterialProps {
  supportmaterial_id: number;
}

export type SupportMaterialType = {
  id: number;
  order: number;
  title: string;
  description: string;
  media_type: string | null;
};

export default function EditSupportMaterial({
  supportmaterial_id,
}: SupportMaterialProps) {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(false);

  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );

  const [supportmaterial, setSupportMaterial] = useState<SupportMaterialType>();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsPageLoading(true);
    SupportMaterialsService.getMaterial(class_id, supportmaterial_id)
      .then((data) => {
        setSupportMaterial(data);
      })
      .catch((err) => {
        setError(true);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [class_id, supportmaterial_id]);

  if (isPageLoading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>UNO - Materiais de apoio</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container px-4">
        <div className="row g-3 mt-2 mb-4">
          <PageHeader
            header_text={supportmaterial?.order + ". " + supportmaterial?.title}
          />
        </div>

        {error && (
          <div className="row g-3 my-2">
            <ErrorCard message="Ocorreu um erro ao obter a informação do material de apoio. Por favor tente novamente." />
          </div>
        )}

        {supportmaterial != undefined && (
          <EditMaterialForm
            supportmaterial_id={supportmaterial.id}
            title={supportmaterial.title}
            description={supportmaterial.description}
            media_type={supportmaterial.media_type}
            setIsLoading={setIsLoading}
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
          />
        )}
      </div>

      <ErrorModal
        show={errorMessage !== ""}
        onHide={() => setErrorMessage("")}
        message={errorMessage}
      />
      <SuccessModal
        show={successMessage !== ""}
        onHide={() => {
          setSuccessMessage("");
        }}
        message={successMessage}
        button_link_path={`/contents/supportmaterials`}
      />
      {isLoading && <LoadingModal />}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supportmaterial_id = context.query.id;

  return {
    props: {
      supportmaterial_id: supportmaterial_id,
    },
  };
};
