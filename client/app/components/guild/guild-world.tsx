import { useRef, useState } from "react";
import { useModal } from "~/hooks/use-modal.hook";
import AddElementModal from "./add-element.modal";
import AddElementManualModal from "./add-element-manual.modal";
import type { Entity, Guild } from "../common.interface";
import { GuildWorldElements } from "./guild-world-element";

export default function GuildWorld(props: {
  guild: Guild;
  world: Entity[];
  page: number;
  isWaiting: boolean;
  hasMore: boolean;
  onClickEntity: (id: string) => void;
  onChangePage: (newPage: number) => void;
}) {
  const [modalType, setModalType] = useState<"generate" | "add" | null>(null);
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { Modal, openModal, closeModal } = useModal();

  return (
    <>
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
              {props.isWaiting && (
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
              {!props.isWaiting && (
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
          world={props.world}
          onClick={props.onClickEntity}
          refs={refs}
        />
        <div className="row-start-3 row-end-4 flex items-center justify-center gap-4 border-t border-stone-300">
          <button
            className="w-full h-full text-sm text-stone-600 hover:bg-stone-100 cursor-pointer transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:text-stone-400 disabled:hover:bg-transparent"
            onClick={() => props.onChangePage(props.page - 1)}
            disabled={props.page <= 1}
          >
            Previous Page
          </button>
          <div className="text-sm text-stone-600">{props.page}</div>
          <button
            className="w-full h-full text-sm text-stone-600 hover:bg-stone-100 cursor-pointer transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:text-stone-400 disabled:hover:bg-transparent"
            onClick={() => props.onChangePage(props.page + 1)}
            disabled={!props.hasMore}
          >
            Next Page
          </button>
        </div>
      </div>
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
    </>
  );
}
