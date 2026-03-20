import { useContext, useEffect, useState } from "react";
import { AuthContext } from "~/contexts/authContext";
import useRequest from "~/hooks/use-request.hook";
import type { Entity } from "../common.interface";

export default function ModifyElementManualModal(props: {
  guildCode: string;
  elementId: string;
  closeModal: () => void;
}) {
  const { auth } = useContext(AuthContext);
  const [page, setPage] = useState(0);
  const [element, setElement] = useState<Entity>({
    id: "",
    name: "",
    description: "",
    secrets: "",
    favorite: false,
    relations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const reqFetchElementDetails = useRequest(
    `/game/element-details/${props.guildCode}/${props.elementId}`,
    "get",
  );
  const reqModifyElement = useRequest("/game/modify-element", "post");

  const fetchElementDetails = async () => {
    try {
      const res = await reqFetchElementDetails.sendRequest({
        authorized: true,
        authorization: auth.accessToken,
      });
      setElement(res?.data.responseObject);
    } catch (ex) {
      console.error("Failed to fetch element details:", ex);
    }
  };

  useEffect(() => {
    fetchElementDetails();
  }, [props.elementId]);

  const handleSubmit = async () => {
    try {
      await reqModifyElement.sendRequest({
        authorized: true,
        authorization: auth.accessToken,
        body: {
          guildCode: props.guildCode,
          elementId: props.elementId,
          element,
        },
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
        </div>
      </div>
    </>
  );
}
