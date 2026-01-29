import { PlusIcon } from "@heroicons/react/20/solid";
import { useContext, useState } from "react";
import { UserContext } from "~/contexts/userContext";
import { postRequest } from "~/request";

export default function CreateGuildModal(props: {}) {
  const user = useContext(UserContext);
  const [iconHovered, setIconHovered] = useState(false);

  const [data, setData] = useState({
    guildName: "",
    guildIcon: null,
  });
  const handleIconClick = () => {};
  const handleCreateGuild = async () => {
    await postRequest(
      "/guild/create",
      {
        icon: "",
        name: data.guildName,
      },
      {
        Authorization: `Bearer ${user.accessToken}`,
        "x-refrehsh-token": user.refreshToken,
      },
    );
  };

  return (
    <div className="flex flex-col min-w-[300px] min-h-[200px]">
      <div>
        <h2 className="text-lg mb-4">Create a New Guild</h2>
        <div className="text-sm text-stone-600 mb-4">
          Create a New Guild for Unique games, you can change it anytime.
        </div>
        <div
          className="w-24 h-24 mb-4 border-3 border-stone-300 border-dotted flex justify-center items-center rounded-xl cursor-pointer"
          onMouseEnter={() => setIconHovered(true)}
          onMouseLeave={() => setIconHovered(false)}
        >
          <div
            className={`w-full h-full text-stone-600 flex justify-center items-center transition duration-200 ${iconHovered ? "opacity-100" : "opacity-0"}`}
          >
            <PlusIcon width={64} height={64} />
          </div>
          <img />
        </div>
        <h3 className="mb-2">
          Guild Name <span className="text-red-600">*</span>
        </h3>
        <input
          type="text"
          placeholder="Give your guild a name"
          value={data.guildName}
          onChange={(e) => {
            setData({ ...data, guildName: e.target.value });
          }}
          className="border border-stone-300 rounded px-2 py-2 mb-4 w-full text-sm"
        />

        <div className="text-xs text-stone-500 mb-4">
          By creating a guild, you agree to Ruler's{" "}
          <span className="text-lime-600 italic cursor-pointer hover:underline">
            Community Guidelines
          </span>{" "}
        </div>

        <div className="flex justify-end w-lg">
          <button
            className="bg-lime-600 text-white px-4 py-2 rounded hover:bg-lime-700 transition duration-200 active:scale-95 cursor-pointer"
            onClick={handleCreateGuild}
          >
            Create Guild
          </button>
        </div>
      </div>
    </div>
  );
}
