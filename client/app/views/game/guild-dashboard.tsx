import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { Entity, Guild } from "~/components/common.interface";
import GuildChat from "~/components/guild/guild-chat";

import GuildHeader from "~/components/guild/guild-header";
import GuildMemberList from "~/components/guild/guild-member-list";
import GuildRefs from "~/components/guild/guild-refs";
import GuildWorld from "~/components/guild/guild-world";
import { AuthContext } from "~/contexts/authContext";
import useLoading from "~/hooks/use-loading.hook";
import useRequest from "~/hooks/use-request.hook";
import useSocket from "~/hooks/use-socket.hook";
import useToast from "~/hooks/use-toast.hook";

export default function Dashboard() {
  const location = useLocation().pathname.split("/")[4];
  const nav = useNavigate();
  const { auth, login } = useContext(AuthContext);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [memberDic, setMemberDic] = useState<
    Record<
      string,
      {
        userId: number;
        userCode: string;
        color: string;
        displayName?: string;
        role: string;
        iconPath?: string;
      }
    >
  >({});
  const [loading, setLoading] = useLoading();
  const [refType, setRefType] = useState<string | null>(null);
  const [refData, setRefData] = useState<any>(null);
  const [world, setWorld] = useState<Entity[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const { isConnected, payloads, sendMessage } = useSocket();

  const [toast, addToast] = useToast();
  const reqFetchGuildData = useRequest(`/guild/code/${location}`, "get");

  useEffect(() => {
    if (!isConnected || !guild) return;
    for (const payload of payloads) {
      if (
        payload.type === "GUILD_HISTORY_UPDATE" &&
        payload.guildCode === guild.code
      ) {
        setWorld(payload.content);
      }
      if (
        payload.type === "GUILD_FLAG_WAITING" &&
        payload.guildCode === guild.code
      ) {
        setIsWaiting(true);
      }
      if (
        payload.type === "GUILD_FLAG_DOWN" &&
        payload.guildCode === guild.code
      ) {
        setIsWaiting(false);
      }
    }
  }, [isConnected, payloads, guild?.code]);

  const setInitialData = (data: any) => {
    setGuild(data.guild);
    if (auth.guildCode) {
      setMemberDic(
        data.members.reduce(
          (acc: any, member: any) => {
            acc[member.userCode] = member;
            return acc;
          },
          {
            [auth.guildCode]: {
              userId: 0,
              userCode: data.guild.code,
              displayName: data.guild.name,
              role: "guild",
              iconPath: data.guild.iconPath,
            },
          },
        ),
      );

      console.log(memberDic);
    }
  };

  const fetchGuildData = async () => {
    // Fetch guild data here if needed
    setLoading(true);
    try {
      if (auth.accessToken) {
        const res = await reqFetchGuildData.sendRequest({
          authorized: true,
        });
        setInitialData(res?.data.responseObject);
      }
      addToast("success", "Hello");
    } catch (error) {
      addToast("error", "Failed fetch guild data");
    }
    setLoading(false);
  };

  const onClickEntity = (id: string) => {
    setRefType("entity");
    setRefData(id);
    console.log(id);
  };

  useEffect(() => {
    login({ ...auth, guildCode: guild?.code });
  }, [guild]);
  useEffect(() => {
    fetchGuildData();
  }, [auth.guildCode, auth?.accessToken, location]);

  useEffect(() => {
    if (!isConnected) return;
    sendMessage("USER_JOIN_GUILD");
  }, [isConnected, guild]);

  return (
    <>
      <div className="guild-dashboard">
        <div className="guild-dashboard-header">
          <GuildHeader guild={guild ?? defaultGuild} />
        </div>
        <div className="guild-dashboard-leftside no-scrollbar">
          <GuildMemberList guild={guild ?? defaultGuild} />
        </div>
        <div className="guild-dashboard-mainside no-scrollbar whitespace-pre-wrap">
          <GuildChat guild={guild ?? defaultGuild} memberDic={memberDic} />
        </div>
        <div className="guild-dashboard-subside no-scrollbar whitespace-pre-wrap">
          <GuildRefs
            guild={guild ?? defaultGuild}
            world={world}
            refType={refType}
            data={refData}
          />
        </div>
        <div className="guild-dashboard-rightside no-scrollbar">
          <GuildWorld
            guild={guild ?? defaultGuild}
            world={world}
            isWaiting={isWaiting}
            onClickEntity={onClickEntity}
          />
        </div>
      </div>
      {loading}
      {toast}
    </>
  );
}

const defaultGuild: Guild = {
  id: 0,
  code: "",
  name: "",
  iconPath: undefined,
  ownerId: 0,
  ownerCode: "",
  colorCode: undefined,
  updatedAt: new Date(),
  createdAt: new Date(),
};
