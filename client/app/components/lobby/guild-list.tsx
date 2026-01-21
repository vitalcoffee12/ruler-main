import { useState } from "react";
import { useNavigate } from "react-router";

export default function GuildList(props: { userId: string }) {
  const guilds = [
    { guildId: "guild-1", guildName: "Guild One" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-3", guildName: "Guild One" },
    { guildId: "guild-4", guildName: "Guild Two" },
    { guildId: "guild-5", guildName: "Guild One" },
    { guildId: "guild-6", guildName: "Guild Two" },
    { guildId: "guild-7", guildName: "Guild One" },
    { guildId: "guild-8", guildName: "Guild Two" },
    { guildId: "guild-9", guildName: "Guild One" },
    { guildId: "guild-10", guildName: "Guild Two" },
    { guildId: "guild-11", guildName: "Guild One" },
    { guildId: "guild-12", guildName: "Guild Two" },
    { guildId: "guild-13", guildName: "Guild One" },
    { guildId: "guild-14", guildName: "Guild Two" },
    { guildId: "guild-15", guildName: "Guild Two" },
  ];
  const nav = useNavigate();

  return (
    <>
      <div
        className="row-start-2 row-end-3 px-4 pt-2 max-h-[calc(100vh-var(--spacing)*70)] overflow-y-auto overflow-x-overlay no-scrollbar"
        style={{}}
      >
        {guilds.map((guild) => (
          <GuildListItem
            key={guild.guildId}
            guildId={guild.guildId}
            guildName={guild.guildName}
          />
        ))}
        <GuildListItem guildId="guild-create" guildName="Create Guild" />
      </div>
    </>
  );
}

function GuildListItem(props: { guildId: string; guildName: string }) {
  const nav = useNavigate();
  const isCreateGuild = props.guildId === "guild-create";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative mb-4 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isHovered ? "bg-stone-100" : "bg-stone-300"
        }`}
        onClick={() => {
          if (isCreateGuild) {
          } else {
            nav(`/game/guild/${props.guildId}`);
          }
        }}
      >
        {isCreateGuild ? (
          <span className="material-symbols-outlined text-stone-600 text-sm ">
            add_2
          </span>
        ) : (
          ""
        )}
      </div>

      <div
        className="absolute top-1/2 bg-stone-300 h-5 w-1 rounded transform -translate-y-1/2 -left-4"
        style={{ display: isHovered ? "block" : "none" }}
      ></div>
      <div
        className="absolute top-1/2 rounded bg-stone-800 text-white text-sm px-2 py-1 transform -translate-y-1/2 left-full ml-4 whitespace-nowrap"
        // style={{ display: isHovered ? "block" : "none" }}
      >
        {props.guildName}
      </div>
    </div>
  );
}
