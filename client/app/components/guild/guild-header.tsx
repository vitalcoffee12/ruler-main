import { useState } from "react";
import { useNavigate } from "react-router";
import type { Guild } from "../common.interface";
import GuildKnowledgeBase from "./guild-knowbase";

export default function GuildHeader(props: { guild: Guild }) {
  const nav = useNavigate();
  const [overlaysideOpen, setOverlaysideOpen] = useState(false);

  return (
    <div className="flex justify-between w-full  h-full items-center p-4 ">
      <div
        className="cursor-pointer"
        onClick={() => {
          nav(`/game/guild/code/${props.guild.code}`);
        }}
      >
        {props.guild.name}
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
        <GuildKnowledgeBase guild={props.guild} />
      </div>
    </div>
  );
}
