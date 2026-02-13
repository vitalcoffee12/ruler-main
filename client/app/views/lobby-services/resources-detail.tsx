import { useState } from "react";
import { useParams } from "react-router";
import ImportResourceModal from "~/components/lobby-services/import-resource.modal";
import { useModal } from "~/hooks/use-modal.hook";
import { getRequest, postRequest } from "~/request";

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<null>(null);
  const { Modal, closeModal, openModal } = useModal();

  const onClickFormatForRAG = async (id: string) => {
    if (id === "") return;

    // await postRequest("/resource/format", {
    //   id: Number(id),
    // });
  };

  const onClickImportToKnowledgeBase = async (id: string) => {
    if (id === "") return;
    // TODO : show knowledge base selection modal which guild to import
    await postRequest("/resource/import", {
      id: Number(id),
    });
  };

  const fetchDetailData = async (id: string) => {
    if (id === "") return;
    const response = await getRequest("/resource/detail/", {
      id: Number(id),
    });
    setData(response.data.responseObject);
  };

  return (
    <>
      detail page
      <button
        className="p-2 bg-stone-100 hover:bg-stone-200 cursor-pointer"
        onClick={() => onClickFormatForRAG(id || "")}
      >
        format for RAG
      </button>
      <button
        className="p-2 bg-stone-100 hover:bg-stone-200 cursor-pointer ml-3"
        onClick={() => openModal()}
      >
        Import to Knowledge Base
      </button>
      <Modal>
        <ImportResourceModal id={Number(id)} onClose={closeModal} />
      </Modal>
    </>
  );
}
