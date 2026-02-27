import { forwardRef, memo, useEffect, useRef, useState } from "react";
import type { Entity } from "./guild-world";
import { useModal } from "~/hooks/use-modal.hook";
import ModifyElementManualModal from "./modify-element-manual.modal";

function GuildWorldElement(
  props: {
    guildCode: string;
    node: Entity;
  },
  ref: React.Ref<{ [key: string]: HTMLDivElement | null }>,
) {
  const [noteVisible, setNoteVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuOpenRef = useRef<HTMLDivElement | null>(null);

  const [modalType, setModalType] = useState<"edit" | "ask" | "delete" | null>(
    null,
  );
  const { Modal, openModal, closeModal } = useModal();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && menuRef.current.style.display === "block") {
        if (
          !menuRef.current.contains(event.target as Node) &&
          !menuOpenRef.current?.contains(event.target as Node)
        ) {
          menuRef.current.style.setProperty("display", "none");
          menuRef.current.style.setProperty("height", "0");
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
        setModalType("edit");
        openModal();
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
      icon: "format_quote",
      label: "Quote in Message",
      onClick: () => {
        // Implement the logic to update storyline visibility in the backend if needed
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
        ref={(el) => {
          if (ref && typeof ref !== "function") {
            ref.current![props.node.id] = el;
          }
        }}
        onClick={(e) => {}}
      >
        <div className="flex items-center justify-between mt-1 px-1">
          <div className="text-sm text-stone-700 font-bold px-3">
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
                  menuRef.current.style.setProperty("height", "0");
                } else {
                  menuRef.current.style.setProperty("display", "block");
                  menuRef.current.style.setProperty("height", "fit-content");
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
                className={`p-1 rounded cursor-pointer flex items-center justify-start mt-1 active:scale-85 transition-all duration-100`}
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
          className="absolute top-9 right-3 z-99 transition-all duration-200 bg-white border border-stone-300 rounded-md shadow-lg hidden height-0"
          ref={menuRef}
        >
          {topMenues.map((menu) => (
            <div
              key={menu.icon}
              title={menu.label}
              className={`p-2 rounded cursor-pointer flex items-center gap-1 text-stone-700 transition-all duration-200 text-sm hover:bg-stone-100`}
              onClick={(e) => {
                e.stopPropagation();
                menu.onClick();
                menuRef.current?.style.setProperty("display", "none");
                menuRef.current?.style.setProperty("height", "0");
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
      <Modal>
        {modalType === "edit" && (
          <ModifyElementManualModal
            guildCode={props.guildCode}
            elementId={props.node.id}
            closeModal={closeModal}
          />
        )}
      </Modal>
    </>
  );
}

const ForwardedGuildWorldElement = forwardRef(GuildWorldElement);
export const GuildWorldElements = memo(function GuildWorldElements(props: {
  guildCode: string;
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
        <ForwardedGuildWorldElement
          key={w.id}
          guildCode={props.guildCode}
          node={w}
          ref={props.refs}
        />
      ))}
    </div>
  );
});
