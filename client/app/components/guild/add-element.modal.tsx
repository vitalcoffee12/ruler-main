export default function AddElementModal(props: { guildCode: string }) {
  return (
    <div className="w-lg">
      <div>
        <h2 className="mb-2">Ask for New Elements</h2>
        <div>
          <textarea
            placeholder="Give me any ideas! or you can just leave it blank to let the GM surprise you."
            className="w-full border border-stone-300 rounded-md p-2 h-32 mb-4"
          ></textarea>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="bg-lime-600 text-white rounded-md px-4 py-2 hover:bg-lime-700 transition duration-300 ease-in-out active:scale-95 cursor-pointer flex items-center gap-2">
          <span className="material-symbols-outlined">smart_toy</span> Ask to
          Create
        </button>
      </div>
    </div>
  );
}
