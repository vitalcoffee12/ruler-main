import { forwardRef, memo, useEffect, useRef, useState } from "react";
import { useModal } from "~/hooks/use-modal.hook";
import AddElementModal from "./add-element.modal";
import AddElementManualModal from "./add-element-manual.modal";
import useSocket from "~/hooks/use-socket.hook";
import type { Guild } from "../common.interface";

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

  useEffect(() => {
    if (!hoveredNodeId) {
      for (const w of world) {
        refs.current[w.id]?.classList.remove("bg-yellow-50");
      }
    }
    const rels = relations.filter(
      (rel) =>
        rel.fromNodeId === hoveredNodeId || rel.toNodeId === hoveredNodeId,
    );

    const connectedNodeIds = new Set<string>();
    rels.forEach((rel) => {
      connectedNodeIds.add(rel.fromNodeId);
      connectedNodeIds.add(rel.toNodeId);
    });

    for (const w of world) {
      if (connectedNodeIds.has(w.id) && w.id !== hoveredNodeId) {
        refs.current[w.id]?.classList.add("bg-yellow-50");
      } else {
        refs.current[w.id]?.classList.remove("bg-yellow-50");
      }
    }
  }, [hoveredNodeId]);

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
      <GuildWorldNodes
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

const GuildWorldNodes = memo(function GuildWorldNodes(props: {
  world: Entity[];
  setHoveredNodeId: (nodeId: string | null) => void;
  refs: React.Ref<{ [key: string]: HTMLDivElement | null }>;
}) {
  if (!props.world || props.world.length === 0) {
    return (
      <div className="row-start-2 row-end-3 flex flex-col items-center justify-center text-stone-500 p-4 min0-h-full h-full">
        No entities found.
      </div>
    );
  }
  return (
    <div className="row-start-2 row-end-3 overflow-y-auto no-scrollbar p-4 max-h-[calc(100vh-var(--spacing)*42)] mt-2">
      {props.world.map((w) => (
        <ForwardedGuildWorldNode
          key={w.id}
          node={w}
          onMouseEnter={() => props.setHoveredNodeId(w.id)}
          onMouseLeave={() => props.setHoveredNodeId(null)}
          ref={props.refs}
        />
      ))}
    </div>
  );
});

function GuildWorldNode(
  props: {
    node: Entity;

    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  },
  ref: React.Ref<{ [key: string]: HTMLDivElement | null }>,
) {
  const [isHovered, setIsHovered] = useState(false);
  const [noteVisible, setNoteVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuOpenRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && menuRef.current.style.display === "block") {
        if (
          !menuRef.current.contains(event.target as Node) &&
          !menuOpenRef.current?.contains(event.target as Node)
        ) {
          menuRef.current.style.setProperty("display", "none");
        }
      }
    };
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const topMenues: { icon: string; label: string; onClick: () => void }[] = [
    {
      icon: "edit",
      label: "Edit",
      onClick: () => {
        // Implement the edit logic here
      },
    },
    {
      icon: "smart_toy",
      label: "Ask AI Edit",
      onClick: () => {
        // Implement the AI assist logic here
      },
    },
    {
      icon: "delete",
      label: "Delete",
      onClick: () => {
        // Implement the delete logic here
      },
    },
  ];
  const botMenues: {
    icon: string;
    label: string;
    class?: string;
    onClick: () => void;
  }[] = [
    {
      icon: "description",
      label: "Toggle GM Note",
      class: noteVisible ? "'FILL' 1" : "'FILL' 0",
      onClick: () => {
        setNoteVisible((prev) => !prev);
      }, // Implement the toggle logic for GM Note visibility
    },
    {
      icon: "image",
      label: "Toggle Image",
      class: imageVisible ? "'FILL' 1" : "'FILL' 0",
      onClick: () => {
        setImageVisible((prev) => !prev);
      }, // Implement the toggle logic for Image visibility
    },
    {
      icon: "favorite",
      label: isFavorite ? "Unfavorite" : "Favorite",
      class: isFavorite ? "'FILL' 1" : "'FILL' 0",
      onClick: () => {
        setIsFavorite((prev) => !prev);
        // Implement the logic to update favorite status in the backend if needed
      },
    },
    {
      icon: "signal_cellular_alt",
      label: chartVisible ? "Hide history" : "Show history",
      class: chartVisible ? "'FILL' 1" : "'FILL' 0",
      onClick: () => {
        setChartVisible((prev) => !prev);
        // Implement the logic to update chart visibility in the backend if needed
      },
    },
  ];

  return (
    <>
      <div
        className="top-0 left-0 border border-stone-300 rounded-lg mb-3 bg-white hover:shadow-md cursor-pointer transition-shadow duration-200 relative"
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        ref={(el) => {
          if (ref && typeof ref !== "function") {
            ref.current![props.node.id] = el;
          }
        }}
        onClick={(e) => {}}
      >
        <div className="flex items-center justify-between mt-1 px-1">
          <div
            className="text-sm text-stone-700 font-bold px-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {props.node.name}
          </div>
          <div
            className="material-symbols-outlined text-stone-400 px-3 py-2 no-select"
            style={{
              fontSize: "1.2rem",
            }}
            ref={menuOpenRef}
            onClick={() => {
              if (menuRef.current) {
                if (menuRef.current?.style.display === "block") {
                  menuRef.current.style.setProperty("display", "none");
                } else {
                  menuRef.current.style.setProperty("display", "block");
                }
              }
            }}
          >
            more_horiz
          </div>
        </div>
        <div className="text-sm text-stone-600 px-4">
          {props.node.description}
        </div>
        <div className="mb-1 px-1">
          <ul className="flex items-center justify-between no-select">
            {botMenues.map((menu) => (
              <li
                key={menu.icon}
                title={menu.label}
                className={`p-1 rounded cursor-pointer flex items-center justify-start mt-1`}
                onClick={(e) => {
                  e.stopPropagation();
                  menu.onClick();
                  // Handle other menu actions like Edit and Delete here
                }}
              >
                <span
                  className={`material-symbols-outlined text-stone-400 transition-all duration-100 p-2`}
                  style={{
                    fontVariationSettings: `${menu.class}`,
                    fontSize: "1.2rem",
                  }}
                >
                  {menu.icon}
                  {/* Use the icon name from the menu configuration */}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {props.node.info && (
          <div
            className="p-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm m-3 rounded-r overflow-hidden transition-height duration-300"
            style={{
              display: noteVisible ? "block" : "none",
              height: noteVisible ? "fit-content" : "0",
            }}
          >
            <div className="font-semibold">GM's Note:</div>
            <div>{props.node.info}</div>
          </div>
        )}

        <div
          className="absolute top-10 right-2 z-99 transition-opacity duration-200 bg-white border border-stone-300 rounded-md shadow-lg hidden"
          ref={menuRef}
        >
          {topMenues.map((menu) => (
            <div
              key={menu.icon}
              title={menu.label}
              className={`p-2 rounded cursor-pointer flex items-center gap-1 text-stone-700 transition-opacity duration-200 text-sm hover:bg-stone-100`}
              onClick={(e) => {
                e.stopPropagation();
                menu.onClick();
                menuRef.current?.style.setProperty("display", "none");
                // Handle other menu actions like Edit and Delete here
              }}
            >
              <span
                className={`material-symbols-outlined `}
                style={{
                  fontVariationSettings: `'FILL' 1`,
                  fontSize: "1.2rem",
                }}
              >
                {menu.icon}
                {/* Use the icon name from the menu configuration */}
              </span>
              <span>{menu.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const ForwardedGuildWorldNode = forwardRef(GuildWorldNode);
