import { useEffect, useState } from "react";
import { getRequest, postRequest } from "~/request";

export default function ModifyElementManualModal(props: {
  guildCode: string;
  elementId: string;
  closeModal: () => void;
}) {
  const [page, setPage] = useState(0);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [documentPage, setDocumentPage] = useState(1);
  const [documentMaxPage, setDocumentMaxPage] = useState(1);
  const [documentSearch, setDocumentSearch] = useState("");
  const [termPage, setTermPage] = useState(1);
  const [termMaxPage, setTermMaxPage] = useState(1);
  const [termSearch, setTermSearch] = useState("");

  const [documents, setDocuments] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [element, setElement] = useState<Record<string, any>>({
    name: "",
    description: "",
    documents: [],
    terms: [],
  });

  const fetchElementDetails = async () => {
    try {
      const res = await getRequest(
        `/game/element-details/${props.guildCode}/${props.elementId}`,
      );
      const data = res.data.responseObject;
      setElement({
        name: data.name,
        description: data.description,
        documents: data.documents || [],
        terms: data.terms || [],
      });
    } catch (ex) {
      console.error("Failed to fetch element details:", ex);
    }
  };

  useEffect(() => {
    fetchElementDetails();
  }, [props.elementId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await getRequest("/resource/guild", {
        type: "ruleSet",
        code: props.guildCode,
        page: documentPage,
        search: documentSearch,
      });

      setDocuments(res.data.responseObject.data || []);
      setDocumentMaxPage(res.data.responseObject.maxPage || 1);
    } catch (ex) {
      console.error("Failed to fetch documents:", ex);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTerms = async () => {
    try {
      setIsLoading(true);
      const res = await getRequest("/resource/guild", {
        type: "termSet",
        code: props.guildCode,
        page: termPage,
        search: termSearch,
      });
      setTerms(res.data.responseObject.data || []);
      setTermMaxPage(res.data.responseObject.maxPage || 1);
    } catch (ex) {
      console.error("Failed to fetch terms:", ex);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loadingDocuments) {
      fetchDocuments();
    }
  }, [loadingDocuments, documentPage, documentSearch]);

  useEffect(() => {
    if (loadingTerms) {
      fetchTerms();
    }
  }, [loadingTerms, termPage, termSearch]);

  const handleSubmit = async () => {
    try {
      await postRequest("/game/modify-element", {
        guildCode: props.guildCode,
        elementId: props.elementId,
        element,
      });
    } catch (ex) {
      console.error("Failed to modify element:", ex);
    }
  };

  return (
    <>
      <div className="w-lg">
        <div>
          <h2 className="mb-2">Modify Element</h2>
          {page === 0 && (
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
                  <div className="text-sm text-stone-600 mt-1">
                    Advanced Options
                  </div>
                  <ul className="no-select">
                    <li
                      className="flex items-center text-sm text-stone-500 mt-2 border border-stone-300 p-4 rounded-md cursor-pointer hover:bg-stone-50 transition duration-150"
                      onClick={() => {
                        setPage(1);
                        setLoadingDocuments(true);
                      }}
                    >
                      Import documents from Knowledgebase
                      <span
                        className="material-symbols-outlined ml-2"
                        style={{ fontSize: "1.2rem" }}
                      >
                        keyboard_double_arrow_right
                      </span>
                    </li>
                    <li
                      className="flex items-center text-sm text-stone-500 mt-2 border border-stone-300 p-4 rounded-md cursor-pointer hover:bg-stone-50 transition duration-150"
                      onClick={() => {
                        setPage(2);
                        setLoadingTerms(true);
                      }}
                    >
                      Import terms from Knowledgebase
                      <span
                        className="material-symbols-outlined ml-2"
                        style={{ fontSize: "1.2rem" }}
                      >
                        keyboard_double_arrow_right
                      </span>
                    </li>
                  </ul>
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
                  Modify Element
                </button>
              </div>
            </div>
          )}
          {page === 1 && (
            <div className="w-lg">
              <div>
                <h3 className="mb-2 text-sm text-stone-700">
                  Import documents
                </h3>
                <div>
                  <div className="w-full border border-stone-300 p-2 h-16 no-scrollbar overflow-y-auto flex flex-wrap rounded-md">
                    {element.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="bg-stone-100 text-stone-700 rounded-md px-3 py-1 mr-2 mb-2 flex items-center gap-1"
                      >
                        <span className="text-xs">{doc.title}</span>
                        <span
                          className="material-symbols-outlined text-stone-400 cursor-pointer hover:text-stone-600 transition duration-200"
                          style={{ fontSize: "12px" }}
                          onClick={() => {
                            setElement({
                              ...element,
                              documents: element.documents.filter(
                                (d: any) => d.id !== doc.id,
                              ),
                            });
                          }}
                        >
                          close
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="relative row-start-3 row-end-4 bg-white rounded-md border border-stone-300 text-sm flex items-center gap-1 outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2 sm:text-sm/6 outline-stone-300 focus-within:outline-stone-600 border border-stone-300 w-full mt-3">
                    <input
                      type="text"
                      placeholder={`Search in documents...`}
                      className="w-full px-3 py-2 rounded-md focus:outline-none focus:outline-none "
                      onChange={(e) => {
                        setDocumentSearch(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key == "Enter") {
                          console.log("Searching for:", documentSearch);
                        }
                      }}
                      value={documentSearch}
                    />
                    <div
                      className="material-symbols-outlined p-1.5 no-select cursor-pointer text-stone-400 hover:text-stone-600 
          hover:bg-stone-100 transition duration-200 rounded-full"
                      onClick={() => setDocumentSearch("")}
                      style={{
                        fontSize: "14px",
                        visibility:
                          documentSearch.length > 0 ? "visible" : "hidden",
                      }}
                    >
                      close
                    </div>
                    <div className="material-symbols-outlined no-select cursor-pointer text-stone-400 p-2 hover:text-stone-600 hover:bg-stone-100 transition duration-200 ">
                      search
                    </div>
                  </div>
                  <div className="w-full border border-stone-300 rounded-md h-120 mt-2 overflow-y-auto no-scrollbar pb-10">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <span className="material-symbols-outlined animate-spin text-stone-400">
                          autorenew
                        </span>
                      </div>
                    ) : null}
                    {!isLoading && documents.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <span className="text-stone-400">
                          No documents found
                        </span>
                      </div>
                    ) : (
                      documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="border-b border-stone-200 rounded-md p-3 cursor-pointer hover:bg-stone-50 transition duration-150"
                          onClick={() => {
                            if (
                              !element.documents.some(
                                (d: any) => d.id === doc.id,
                              )
                            ) {
                              setElement({
                                ...element,
                                documents: [
                                  ...element.documents,
                                  { id: doc.id, title: doc.title },
                                ],
                              });
                            }
                          }}
                        >
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-sm text-stone-500">
                            {doc.summary}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex justify-center mt-1 mb-5">
                    <ul className="flex items-center">
                      <li
                        className="p-2 material-symbols-outlined cursor-pointer hover:text-lime-600 transition duration-150"
                        style={{
                          fontSize: "1rem",
                        }}
                        onClick={() =>
                          setDocumentPage((prev) =>
                            prev > 1 ? prev - 1 : prev,
                          )
                        }
                      >
                        arrow_back_ios
                      </li>
                      <li className="text-sm text-stone-600">
                        Page {documentPage} of {documentMaxPage}
                      </li>
                      <li
                        className="p-2 material-symbols-outlined cursor-pointer hover:text-lime-600 transition duration-150"
                        style={{
                          fontSize: "1rem",
                        }}
                        onClick={() =>
                          setDocumentPage((prev) =>
                            prev < documentMaxPage ? prev + 1 : prev,
                          )
                        }
                      >
                        arrow_forward_ios
                      </li>
                    </ul>
                  </div>
                  <div
                    className="text-sm text-stone-600 cursor-pointer flex items-center hover:text-lime-600 mt-1"
                    onClick={() => setPage(0)}
                  >
                    <span className="hover:underline ">
                      Return to Basic Options
                    </span>
                    <span className="material-symbols-outlined">
                      keyboard_double_arrow_left
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {page === 2 && (
            <div className="w-lg">
              <div>
                <h3 className="mb-2 text-sm text-stone-700">Import terms</h3>
                <div>
                  <div className="w-full border border-stone-300 p-2 h-16 no-scrollbar overflow-y-auto flex flex-wrap rounded-md">
                    {element.terms.map((term: any) => (
                      <div
                        key={term.id}
                        className="bg-stone-100 text-stone-700 rounded-md px-3 py-1 mr-2 mb-2 flex items-center gap-1"
                      >
                        <span className="text-xs">{term.term}</span>
                        <span
                          className="material-symbols-outlined text-stone-400 cursor-pointer hover:text-stone-600 transition duration-200"
                          style={{ fontSize: "12px" }}
                          onClick={() => {
                            setElement({
                              ...element,
                              terms: element.terms.filter(
                                (t: any) => t.id !== term.id,
                              ),
                            });
                          }}
                        >
                          close
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="relative row-start-3 row-end-4 bg-white rounded-md border border-stone-300 text-sm flex items-center gap-1 outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2 sm:text-sm/6 outline-stone-300 focus-within:outline-stone-600 border border-stone-300 w-full mt-3">
                    <input
                      type="text"
                      placeholder={`Search in terms...`}
                      className="w-full px-3 py-2 rounded-md focus:outline-none focus:outline-none "
                      onChange={(e) => {
                        setTermSearch(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key == "Enter") {
                          console.log("Searching for:", termSearch);
                        }
                      }}
                      value={termSearch}
                    />
                    <div
                      className="material-symbols-outlined p-1.5 no-select cursor-pointer text-stone-400 hover:text-stone-600 
          hover:bg-stone-100 transition duration-200 rounded-full"
                      onClick={() => setTermSearch("")}
                      style={{
                        fontSize: "14px",
                        visibility:
                          termSearch.length > 0 ? "visible" : "hidden",
                      }}
                    >
                      close
                    </div>
                    <div className="material-symbols-outlined no-select cursor-pointer text-stone-400 p-2 hover:text-stone-600 hover:bg-stone-100 transition duration-200 ">
                      search
                    </div>
                  </div>
                  <div className="w-full border border-stone-300 rounded-md h-120 mt-2 overflow-y-auto no-scrollbar pb-10">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <span className="material-symbols-outlined animate-spin text-stone-400">
                          autorenew
                        </span>
                      </div>
                    ) : null}
                    {!isLoading && terms.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <span className="text-stone-400">No terms found</span>
                      </div>
                    ) : (
                      terms.map((term) => (
                        <div
                          key={term.id}
                          className="border-b border-stone-200 rounded-md p-3 cursor-pointer hover:bg-stone-50 transition duration-150"
                          onClick={() => {
                            if (
                              !element.terms.some((t: any) => t.id === term.id)
                            ) {
                              setElement({
                                ...element,
                                terms: [
                                  ...element.terms,
                                  { id: term.id, term: term.term },
                                ],
                              });
                            }
                          }}
                        >
                          <div className="font-medium">{term.term}</div>
                          <div className="text-sm text-stone-500">
                            {term.description}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex justify-center mt-1 mb-5">
                    <ul className="flex items-center">
                      <li
                        className="p-2 material-symbols-outlined cursor-pointer hover:text-lime-600 transition duration-150"
                        style={{
                          fontSize: "1rem",
                        }}
                        onClick={() =>
                          setTermPage((prev) => (prev > 1 ? prev - 1 : prev))
                        }
                      >
                        arrow_back_ios
                      </li>
                      <li className="text-sm text-stone-600">
                        Page {termPage} of {termMaxPage}
                      </li>
                      <li
                        className="p-2 material-symbols-outlined cursor-pointer hover:text-lime-600 transition duration-150"
                        style={{
                          fontSize: "1rem",
                        }}
                        onClick={() =>
                          setTermPage((prev) =>
                            prev < termMaxPage ? prev + 1 : prev,
                          )
                        }
                      >
                        arrow_forward_ios
                      </li>
                    </ul>
                  </div>
                  <div
                    className="text-sm text-stone-600 cursor-pointer flex items-center hover:text-lime-600 mt-1"
                    onClick={() => setPage(0)}
                  >
                    <span className="hover:underline ">
                      Return to Basic Options
                    </span>
                    <span className="material-symbols-outlined">
                      keyboard_double_arrow_left
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
