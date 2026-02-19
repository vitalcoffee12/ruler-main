import { useState } from "react";
import { postRequest } from "~/request";

export default function AddElementManualModal(props: {
  guildCode: string;
  closeModal: () => void;
}) {
  const [element, setElement] = useState<Record<string, any>>({
    name: "",
    type: "",
    description: "",
    rules: [],
  });

  const handleSubmit = async () => {
    try {
      await postRequest("/game/add-element", {
        guildCode: props.guildCode,
        element,
      });
    } catch (ex) {
      console.error("Failed to add element:", ex);
    }
  };

  return (
    <div className="w-lg">
      <div>
        <h2 className="mb-2">Add New Element</h2>
        <div>
          <input
            type="text"
            placeholder="Element Name *"
            className="w-full border border-stone-300 rounded-md p-2 mb-4"
            value={element.name}
            onChange={(e) => setElement({ ...element, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Element Type"
            className="w-full border border-stone-300 rounded-md p-2 mb-4"
            value={element.type}
            onChange={(e) => setElement({ ...element, type: e.target.value })}
          />
          <textarea
            placeholder="Element Description"
            className="w-full border border-stone-300 rounded-md p-2 h-32 mb-4"
            value={element.description}
            onChange={(e) =>
              setElement({ ...element, description: e.target.value })
            }
          ></textarea>
        </div>
      </div>
      <div className="flex justify-end">
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
  );
}
