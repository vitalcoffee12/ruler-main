import { forwardRef, memo, useEffect, useRef, useState } from "react";

export default function GuildWorld(props: {
  guildId: string;
  worlds: { nodeId: string; name: string; description: string }[];
  relations: { fromNodeId: string; toNodeId: string; type: string }[];
}) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!hoveredNodeId) {
      for (const world of props.worlds) {
        refs.current[world.nodeId]?.classList.remove("bg-yellow-50");
      }
    }
    const rels = props.relations.filter(
      (rel) =>
        rel.fromNodeId === hoveredNodeId || rel.toNodeId === hoveredNodeId
    );

    const connectedNodeIds = new Set<string>();
    rels.forEach((rel) => {
      connectedNodeIds.add(rel.fromNodeId);
      connectedNodeIds.add(rel.toNodeId);
    });

    for (const world of props.worlds) {
      if (
        connectedNodeIds.has(world.nodeId) &&
        world.nodeId !== hoveredNodeId
      ) {
        refs.current[world.nodeId]?.classList.add("bg-yellow-50");
      } else {
        refs.current[world.nodeId]?.classList.remove("bg-yellow-50");
      }
    }
  }, [hoveredNodeId]);

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
            <div>
              <div className="inline-flex items-center cursor-pointer text-stone-600 hover:text-stone-800 mr-1">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.2rem" }}
                >
                  wand_stars
                </span>
                <span className="text-sm ml-1">Ask Gm to Create</span>
              </div>
              <div className="inline-flex items-center ml-1 mr-2 cursor-pointer text-stone-600 hover:text-stone-800">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.2rem" }}
                >
                  add
                </span>
                <span className="text-sm ml-1">Add Element</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GuildWorldNodes
        worlds={props.worlds}
        setHoveredNodeId={setHoveredNodeId}
        refs={refs}
      />
    </div>
  );
}

const GuildWorldNodes = memo(function GuildWorldNodes(props: {
  worlds: { nodeId: string; name: string; description: string }[];
  setHoveredNodeId: (nodeId: string | null) => void;
  refs: React.Ref<{ [key: string]: HTMLDivElement | null }>;
}) {
  if (props.worlds.length === 0) {
    return (
      <div className="row-start-2 row-end-3 flex flex-col items-center justify-center text-stone-500 p-4 min0-h-full h-full">
        No worlds found.
      </div>
    );
  }
  return (
    <div className="row-start-2 row-end-3 overflow-y-auto no-scrollbar p-4 max-h-[calc(100vh-var(--spacing)*42)] mt-2">
      {props.worlds.map((world) => (
        <ForwardedGuildWorldNode
          key={world.nodeId}
          nodeId={world.nodeId}
          name={world.name}
          description={world.description}
          onMouseEnter={() => props.setHoveredNodeId(world.nodeId)}
          onMouseLeave={() => props.setHoveredNodeId(null)}
          ref={props.refs}
        />
      ))}
    </div>
  );
});

function GuildWorldNode(
  props: {
    nodeId: string;
    name: string;
    description: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  },
  ref: React.Ref<{ [key: string]: HTMLDivElement | null }>
) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="top-0 left-0  border border-stone-300 rounded-lg p-3 mb-3 bg-white hover:shadow-md cursor-pointer"
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      ref={(el) => {
        if (ref && typeof ref !== "function") {
          ref.current![props.nodeId] = el;
        }
      }}
      onClick={(e) => {}}
    >
      <div className="flex items-center gap-2">
        <div
          className="text-xs text-stone-700 bg-stone-300 rounded-sm px-1 hover:bg-stone-400 transition duration-300 ease-in-out"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {props.nodeId}
        </div>
        <div className="font-bold">{props.name}</div>
      </div>
      <div className="text-sm text-stone-600">{props.description}</div>
    </div>
  );
}

const ForwardedGuildWorldNode = forwardRef(GuildWorldNode);
