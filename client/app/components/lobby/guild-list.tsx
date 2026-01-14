import { useState } from "react";
import { useNavigate } from "react-router";

export default function GuildList(props: { userId: string }) {
  const guilds = [
    { guildId: "guild-1", guildName: "Guild One" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-1", guildName: "Guild One" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-1", guildName: "Guild One" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-1", guildName: "Guild One" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-1", guildName: "Guild One" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-1", guildName: "Guild One" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-1", guildName: "Guild One" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-2", guildName: "Guild Two" },
    { guildId: "guild-2", guildName: "Guild Two" },
  ];
  const nav = useNavigate();

  return (
    <>
      <div className="no-scrollbar">
        <div className="p-4 pb-0">
          <div
            className="w-12 h-12 flex items-center justify-center border-b border-stone-300 cursor-pointer pb-2 text-2xl font-bold"
            onClick={() => {
              nav("/");
            }}
          >
            R
          </div>
        </div>
        <div className="p-4 max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden no-scrollbar">
          {guilds.map((guild) => (
            <GuildListItem
              key={guild.guildId}
              guildId={guild.guildId}
              guildName={guild.guildName}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function GuildListItem(props: { guildId: string; guildName: string }) {
  const nav = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="relative mb-4 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`w-12 h-12 rounded-xl ${
          isHovered ? "bg-stone-100" : "bg-stone-300"
        }`}
        onClick={() => {
          nav(`/game/${props.guildId}`);
        }}
      ></div>

      <div
        className="absolute top-1/2 bg-stone-300 h-4 w-1 rounded transform -translate-y-1/2 left-full ml-2"
        style={{ display: isHovered ? "block" : "none" }}
      />
      <div
        className="absolute top-1/2 rounded bg-stone-800 text-white text-sm px-2 py-1 transform -translate-y-1/2 left-full ml-4 whitespace-nowrap"
        style={{ display: isHovered ? "block" : "none" }}
      >
        {props.guildName}
      </div>
    </div>
  );
}
