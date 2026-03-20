import { useContext, useEffect, useState } from "react";
import { AuthContext } from "~/contexts/authContext";
import useRequest from "~/hooks/use-request.hook";

export default function AddElementManualModal(props: {
  guildCode: string;
  closeModal: () => void;
}) {
  const { auth } = useContext(AuthContext);
  const [element, setElement] = useState<Record<string, any>>({
    name: "",
    description: "",
    secrets: "",
    relations: [],
  });

  const reqAddElement = useRequest("/game/add-element", "post");

  // const [page, setPage] = useState(1);
  // const [loadingDocuments, setLoadingDocuments] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  // const [loadingTerms, setLoadingTerms] = useState(false);
  // const [documentPage, setDocumentPage] = useState(1);
  // const [documentMaxPage, setDocumentMaxPage] = useState(1);
  // const [documentSearch, setDocumentSearch] = useState("");
  // const [termPage, setTermPage] = useState(1);
  // const [termMaxPage, setTermMaxPage] = useState(1);
  // const [termSearch, setTermSearch] = useState("");

  // const [documents, setDocuments] = useState<any[]>([]);
  // const [terms, setTerms] = useState<any[]>([]);

  // const fetchDocuments = async () => {
  //   try {
  //     setIsLoading(true);
  //     const res = await getRequest("/resource/guild", {
  //       type: "ruleSet",
  //       code: props.guildCode,
  //       page: documentPage,
  //       search: documentSearch,
  //     });

  //     setDocuments(res.data.responseObject.data || []);
  //     setDocumentMaxPage(res.data.responseObject.maxPage || 1);
  //   } catch (ex) {
  //     console.error("Failed to fetch documents:", ex);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const fetchTerms = async () => {
  //   try {
  //     setIsLoading(true);
  //     const res = await getRequest("/resource/guild", {
  //       type: "termSet",
  //       code: props.guildCode,
  //       page: termPage,
  //       search: termSearch,
  //     });
  //     setTerms(res.data.responseObject.data || []);
  //     setTermMaxPage(res.data.responseObject.maxPage || 1);
  //   } catch (ex) {
  //     console.error("Failed to fetch terms:", ex);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSubmit = async () => {
    try {
      const res = await reqAddElement.sendRequest({
        authorized: true,
        authorization: auth.accessToken,
        body: {
          guildCode: props.guildCode,
          element,
        },
      });
    } catch (ex) {}
  };

  // useEffect(() => {
  //   if (loadingDocuments) {
  //     fetchDocuments();
  //   }
  // }, [loadingDocuments, documentPage, documentSearch]);

  // useEffect(() => {
  //   if (loadingTerms) {
  //     fetchTerms();
  //   }
  // }, [loadingTerms, termPage, termSearch]);

  return (
    <>
      <div className="w-lg">
        <div>
          <h2 className="mb-2">Add New Element</h2>

          <div>
            <div>
              <div>
                <div className="text-sm text-stone-600 mt-1 mb-2">
                  Basic Options
                </div>
                <input
                  type="text"
                  placeholder="Element Name *"
                  className="w-full border border-stone-300 rounded-md p-2"
                  value={element.name}
                  onChange={(e) =>
                    setElement({ ...element, name: e.target.value })
                  }
                />
                <div className="text-xs text-stone-400 text-right mt-1 mb-2">
                  {element.name.length} / 50
                </div>
                <textarea
                  placeholder="Element Description"
                  className="w-full border border-stone-300 rounded-md p-2 h-32"
                  value={element.description}
                  onChange={(e) =>
                    setElement({ ...element, description: e.target.value })
                  }
                ></textarea>
                <div className="text-xs text-stone-400 text-right">
                  {element.description.length} / 500
                </div>
                <textarea
                  placeholder="Element Secrets"
                  className="w-full border border-stone-300 rounded-md p-2 h-32"
                  value={element.secrets}
                  onChange={(e) =>
                    setElement({ ...element, secrets: e.target.value })
                  }
                ></textarea>
                <div className="text-xs text-stone-400 text-right">
                  {element.description.length} / 500
                </div>
                <div className="text-sm text-lime-500 mt-1 hover:text-underline">
                  Advanced Options
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                className="bg-lime-600 text-white rounded-md px-4 py-2 hover:bg-lime-700 transition duration-300 ease-in-out active:scale-95 cursor-pointer"
                onClick={async () => {
                  await handleSubmit();
                  props.closeModal();
                }}
              >
                Add Element
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
