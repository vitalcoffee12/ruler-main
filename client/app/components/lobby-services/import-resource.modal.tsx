import { useContext, useEffect, useState } from "react";
import type { Guild } from "../common.interface";
import { getRequest, postRequest } from "~/request";
import { UserContext } from "~/contexts/userContext";

export default function ImportResourceModal(props: {
  id: number;
  onClose: () => void;
}) {
  const user = useContext(UserContext);
  const [guilds, setGuilds] = useState<(Guild & { selected?: boolean })[]>([]);

  const fetchGuilds = async () => {
    try {
      const res = await getRequest("/guild/user", {
        userId: user?.id,
        userCode: user?.code,
      });

      if (res.status === 200 && res.data) {
        setGuilds(res.data.responseObject);
      }
    } catch (ex) {}
  };

  const onClickImport = async () => {
    const selectedGuilds = guilds.filter((g) => g.selected);
    await postRequest("/resource/import", {
      id: props.id,
      guildCodes: selectedGuilds.map((g) => g.code),
    });
    props.onClose();
  };

  useEffect(() => {
    fetchGuilds();
  }, [user.code]);

  return (
    <>
      <div className="">
        <div className="flex flex-col min-w-lg">
          <h2 className="text-lg mb-4">Import Resource</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for guild"
              className="
          text-sm border border-stone-300 rounded px-2 py-2 mb-4 w-full"
            />
            <span className="material-symbols-outlined absolute right-2 top-2 cursor-pointer">
              search
            </span>
          </div>
          <div className="w-full border rounded-lg border-stone-300 max-h-[300px] overflow-y-auto mb-4 no-scrollbar">
            {guilds.map((guild) => (
              <GuildItem
                key={guild.id}
                guild={guild}
                onClick={() => {
                  setGuilds((prev) =>
                    prev.map((g) => {
                      if (g.id === guild.id) {
                        return { ...g, selected: !g.selected };
                      }
                      return g;
                    }),
                  );
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <button
            className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded transtition duration-200 active:scale-95"
            onClick={async () => {
              await onClickImport();
            }}
          >
            Import
          </button>
        </div>
      </div>
    </>
  );
}

function GuildItem(props: {
  guild: Guild & { selected?: boolean };
  onClick?: () => void;
}) {
  return (
    <div
      className="flex justify-between items-center  hover:bg-stone-100 p-3 transition duration-200 cursor-pointer no-select"
      onClick={props.onClick}
    >
      <div className="flex items-center">
        {!props.guild.iconPath && (
          <div
            className="w-10 h-10 rounded-full mr-2 flex justify-center items-center text-stone-600"
            style={{
              backgroundColor: props.guild.colorCode ?? "#cccccc",
            }}
          ></div>
        )}
        {props.guild.iconPath && (
          <img
            src={props.guild.iconPath}
            alt={props.guild.name}
            className="w-10 h-10 rounded-full mr-2"
          />
        )}
        <div>
          <span className="block font-semibold">{props.guild.name}</span>
          <span className="text-sm text-stone-500">{props.guild.code}</span>
        </div>
      </div>
      <div className="flex items-center">
        {props.guild.selected && (
          <span className="material-symbols-outlined text-lime-600 ml-4">
            check
          </span>
        )}
      </div>
    </div>
  );
}
