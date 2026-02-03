import { useState } from "react";
import { useNavigate } from "react-router";

export default function GuildHeader(props: {
  guildCode: string;
  guildName: string;
}) {
  const nav = useNavigate();
  const [overlaysideOpen, setOverlaysideOpen] = useState(false);

  return (
    <div className="flex justify-between w-full  h-full items-center p-4 ">
      <div
        className="cursor-pointer"
        onClick={() => {
          nav(`/game/guild/code/${props.guildCode}`);
        }}
      >
        {props.guildName}
      </div>
      <div
        className={`material-symbols-outlined cursor-pointer hover:bg-stone-100 rounded-lg p-2 text-stone-600 no-select ${
          overlaysideOpen ? "bg-stone-200" : ""
        }`}
        onClick={() => {
          setOverlaysideOpen(!overlaysideOpen);
        }}
      >
        book_4
      </div>
      <div
        className={`guild-dashboard-overlayside ${
          overlaysideOpen ? "" : "closed"
        }`}
      >
        asldkjalkdjf
      </div>
    </div>
  );
}
