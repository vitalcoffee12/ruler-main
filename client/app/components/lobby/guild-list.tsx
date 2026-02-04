import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { UserContext } from "~/contexts/userContext";
import { getRequest } from "~/request";

export default function GuildList(props: {
  refreshGuildList?: boolean;
  onClickCreateGuild?: () => void;
}) {
  const user = useContext(UserContext);
  const badgeRef = useRef<HTMLDivElement>(null);
  const refs = useRef<
    { code: string; name: string; element: HTMLDivElement }[]
  >([]);
  const [hoveredGuildCode, setHoveredGuildCode] = useState<string | null>(null);
  const [guilds, setGuilds] = useState<
    { code: string; name: string; colorCode?: string }[]
  >([]);
  const nav = useNavigate();

  const fetchGuilds = async () => {
    try {
      const res = await getRequest("/guild/user", {
        userId: user?.id,
        userCode: user?.code,
      });

      if (res.status === 200 && res.data) {
        setGuilds(res.data.responseObject);
      }
    } catch (ex) {
      console.log(ex);
    }
  };

  useEffect(() => {
    fetchGuilds();
  }, [user, props.refreshGuildList]);

  useEffect(() => {
    if (hoveredGuildCode) {
      const ref = refs.current.find((r) => r.code === hoveredGuildCode);
      console.log(refs.current);
      if (ref) {
        const rect = ref.element.getBoundingClientRect();
        badgeRef.current?.style.setProperty(
          "top",
          `${rect.top + rect.height / 2 - badgeRef.current.offsetHeight / 2}px`,
        );
        badgeRef.current?.style.setProperty("left", `${rect.right + 10}px`);
        badgeRef.current!.innerText = ref.name;
      }
      badgeRef.current?.style.setProperty("opacity", "1");
      badgeRef.current?.style.setProperty("scale", "1");
      console.log(hoveredGuildCode);
    } else {
      badgeRef.current?.style.setProperty("opacity", "0");
      badgeRef.current?.style.setProperty("scale", "0.95");
    }
  }, [hoveredGuildCode]);

  return (
    <>
      <div
        ref={badgeRef}
        className="fixed top-0 left-0 bg-white border border-stone-100 rounded shadow-md py-1 px-2 text-sm transition duration-300 pointer-events-none z-10"
      ></div>
      <div
        className="row-start-2 row-end-3 px-4 pt-2 max-h-[calc(100vh-var(--spacing)*70)] overflow-y-auto overflow-x-overlay no-scrollbar"
        style={{}}
      >
        {guilds.map((guild) => (
          <GuildListItem
            key={guild.code}
            code={guild.code}
            name={guild.name}
            colorCode={guild.colorCode ?? "#CCCCCC"}
            ref={(el) => {
              if (el) {
                const existingIndex = refs.current.findIndex(
                  (ref) => ref.code === guild.code,
                );
                if (existingIndex === -1) {
                  refs.current.push({
                    code: guild.code,
                    name: guild.name,
                    element: el,
                  });
                } else {
                  refs.current[existingIndex].element = el;
                }
              } else {
                refs.current = refs.current.filter(
                  (ref) => ref.code !== guild.code,
                );
              }
            }}
            onHover={() => setHoveredGuildCode(guild.code)}
            onLeave={() => setHoveredGuildCode(null)}
          />
        ))}
        <GuildListItem
          ref={null}
          code="guild-create"
          name="Create Guild"
          onClick={props.onClickCreateGuild}
        />
      </div>
    </>
  );
}

function GuildListItem(props: {
  ref: React.Ref<HTMLDivElement>;
  code: string;
  name: string;
  colorCode?: string;
  onClick?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
}) {
  const nav = useNavigate();
  const isCreateGuild = props.code === "guild-create";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={props.ref}
      className="relative mb-4 cursor-pointer"
      onMouseEnter={() => {
        setIsHovered(true);
        if (props.onHover) props.onHover();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (props.onLeave) props.onLeave();
      }}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-stone-100 transition duration-200 ${
          isHovered ? "brightness-80" : "brightness-100"
        }`}
        style={{ backgroundColor: props.colorCode }}
        onClick={() => {
          if (isCreateGuild) {
            if (props.onClick) {
              props.onClick();
            }
          } else {
            nav(`/game/guild/code/${props.code}`);
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
        {props.name}
      </div>
    </div>
  );
}
