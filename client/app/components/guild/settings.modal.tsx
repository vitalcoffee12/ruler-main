export default function SettingsModal(props: {
  guildId: number;
  guildCode: string;
}) {
  return (
    <div className="w-xl">
      <div className="">
        <h2 className="mb-2 text-sm text-stone-600">Guild Settings</h2>
        <div>
          <label className="block mb-2">Guild Icon (optional)</label>
        </div>
        <div>
          <label className="block mb-2">Guild Basic</label>
        </div>
        <input
          type="text"
          placeholder="Guild Name *"
          className="w-full border border-stone-300 rounded-md p-2 mb-4"
        />
        <textarea
          placeholder="Guild Description (optional)"
          className="w-full border border-stone-300 rounded-md p-2 mb-4 h-32"
        ></textarea>
        <div className="flex justify-end">
          <button className="bg-lime-600 text-white rounded-md px-4 py-2 hover:bg-lime-700 transition duration-300 ease-in-out active:scale-95 cursor-pointer flex items-center gap-2">
            <span className="material-symbols-outlined">save</span> Save
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
