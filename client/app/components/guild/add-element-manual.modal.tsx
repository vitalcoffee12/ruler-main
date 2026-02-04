export default function AddElementManualModal(props: { guildCode: string }) {
  return (
    <div className="w-lg">
      <div>
        <h2 className="mb-2">Add New Element</h2>
        <div>
          <input
            type="text"
            placeholder="Element Name *"
            className="w-full border border-stone-300 rounded-md p-2 mb-4"
          />
          <textarea
            placeholder="Element Description"
            className="w-full border border-stone-300 rounded-md p-2 h-32 mb-4"
          ></textarea>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="bg-lime-600 text-white rounded-md px-4 py-2 hover:bg-lime-700 transition duration-300 ease-in-out active:scale-95 cursor-pointer">
          Add Element
        </button>
      </div>
    </div>
  );
}
