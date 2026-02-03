import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { UserContext } from "~/contexts/userContext";
import { getRequest } from "~/request";

export default function GuildList(props: {
  userId: string;
  refreshGuildList?: boolean;
  onClickCreateGuild?: () => void;
}) {
  const user = useContext(UserContext);
  const [guilds, setGuilds] = useState<{ code: string; name: string }[]>([]);
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

  return (
    <>
      <div
        className="row-start-2 row-end-3 px-4 pt-2 max-h-[calc(100vh-var(--spacing)*70)] overflow-y-auto overflow-x-overlay no-scrollbar"
        style={{}}
      >
        {guilds.map((guild) => (
          <GuildListItem key={guild.code} code={guild.code} name={guild.name} />
        ))}
        <GuildListItem
          code="guild-create"
          name="Create Guild"
          onClick={props.onClickCreateGuild}
        />
      </div>
    </>
  );
}

function GuildListItem(props: {
  code: string;
  name: string;
  onClick?: () => void;
}) {
  const nav = useNavigate();
  const isCreateGuild = props.code === "guild-create";
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
