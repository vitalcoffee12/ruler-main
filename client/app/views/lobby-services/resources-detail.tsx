import { useState } from "react";
import { useParams } from "react-router";
import { getRequest, postRequest } from "~/request";

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<null>(null);

  const onClickFormatForRAG = async (id: string) => {
    if (id === "") return;

    await postRequest(
      "/resource/format",
      {
        id: Number(id),
      },
      {},
      10000000000000,
    );
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
    </>
  );
}
