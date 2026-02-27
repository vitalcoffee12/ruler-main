import { forwardRef, memo, useEffect, useRef, useState } from "react";
import { useModal } from "~/hooks/use-modal.hook";
import AddElementModal from "./add-element.modal";
import AddElementManualModal from "./add-element-manual.modal";
import useSocket from "~/hooks/use-socket.hook";
import type { Guild } from "../common.interface";
import ModifyElementManualModal from "./modify-element-manual.modal";
import { GuildWorldElements } from "./guild-world-element";

export interface Entity {
  id: string;
  name: string;
  description: string;
  info?: string; // Optional field for GM's reference, not used in gameplay
  rules: { id: number; version: number }[];
  scoreDiff?: number;
  favorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function GuildWorld(props: { guild: Guild }) {
  const [modalType, setModalType] = useState<"generate" | "add" | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [world, setWorld] = useState<Entity[]>([]);
  const [relations, setRelations] = useState<
    { fromNodeId: string; toNodeId: string; type: string }[]
  >([]);
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isWaiting, setIsWaiting] = useState(false);
  const { Modal, openModal, closeModal } = useModal();

  // useEffect(() => {
  //   if (!hoveredNodeId) {
  //     for (const w of world) {
  //       refs.current[w.id]?.classList.remove("bg-yellow-50");
  //     }
  //   }
  //   const rels = relations.filter(
  //     (rel) =>
  //       rel.fromNodeId === hoveredNodeId || rel.toNodeId === hoveredNodeId,
  //   );

  //   const connectedNodeIds = new Set<string>();
  //   rels.forEach((rel) => {
  //     connectedNodeIds.add(rel.fromNodeId);
  //     connectedNodeIds.add(rel.toNodeId);
  //   });

  //   for (const w of world) {
  //     if (connectedNodeIds.has(w.id) && w.id !== hoveredNodeId) {
  //       refs.current[w.id]?.classList.add("bg-yellow-50");
  //     } else {
  //       refs.current[w.id]?.classList.remove("bg-yellow-50");
  //     }
  //   }
  // }, [hoveredNodeId]);

  const { isConnected, payloads, sendMessage } = useSocket();
  useEffect(() => {
    if (!isConnected) return;
    for (const payload of payloads) {
      if (
        payload.type === "GUILD_HISTORY_UPDATE" &&
        payload.guildCode === props.guild.code
      ) {
        setWorld(payload.content.world);
      }
      if (
        payload.type === "GUILD_FLAG_WAITING" &&
        payload.guildCode === props.guild.code
      ) {
        setIsWaiting(true);
      }
      if (
        payload.type === "GUILD_FLAG_DOWN" &&
        payload.guildCode === props.guild.code
      ) {
        setIsWaiting(false);
      }
    }
  }, [isConnected, payloads, props.guild.code]);

  return (
    <div className="guild-world">
      <div className="row-start-1 row-end-2 p-4">
        <div className="flex items-center rounded-md bg-white outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2 sm:text-sm/6 outline-stone-300 focus-within:outline-stone-600 border border-stone-300 h-10 w-full">
          <input
            type="text"
            placeholder="Search worlds..."
            className="block min-w-0 grow bg-white ml-3 text-base focus:outline-none sm:text-sm/6"
          />
          <button className="flex items-center justify-center hover:bg-stone-100 w-12 h-full cursor-pointer">
            <span className="material-symbols-outlined text-stone-700">
              search
            </span>
          </button>
        </div>
        <div>
          <div className="border-b border-stone-300 my-4 flex items-center justify-between ">
            <span className="text-stone-600 text-sm">Worlds</span>
            {isWaiting && (
              <div className="inline-flex items-center text-sm text-yellow-600">
                <span
                  className="material-symbols-outlined animate-pulse"
                  style={{ fontSize: "1.2rem" }}
                >
                  hourglass_top
                </span>
                <span className="ml-1">Waiting for GM's response...</span>
              </div>
            )}
            {!isWaiting && (
              <div>
                <div
                  className="inline-flex items-center cursor-pointer text-stone-600 hover:text-stone-800 mr-1"
                  onClick={() => {
                    setModalType("generate");
                    openModal();
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.2rem" }}
                  >
                    wand_stars
                  </span>
                  <span className="text-sm ml-1">Ask Gm to Create</span>
                </div>
                <div
                  className="inline-flex items-center ml-1 mr-2 cursor-pointer text-stone-600 hover:text-stone-800"
                  onClick={() => {
                    setModalType("add");
                    openModal();
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.2rem" }}
                  >
                    add
                  </span>
                  <span className="text-sm ml-1">Add Element</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <GuildWorldElements
        guildCode={props.guild.code}
        world={world}
        setHoveredNodeId={setHoveredNodeId}
        refs={refs}
      />
      <Modal>
        {modalType === "generate" && (
          <AddElementModal
            guildCode={props.guild.code}
            closeModal={closeModal}
          />
        )}
        {modalType === "add" && (
          <AddElementManualModal
            guildCode={props.guild.code}
            closeModal={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}
