import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import GuildChat, {
  type GuildChatMessage,
} from "~/components/guild/guild-chat";
import GuildHeader from "~/components/guild/guild-header";
import GuildMemberList from "~/components/guild/guild-member-list";
import GuildRefs from "~/components/guild/guild-refs";
import GuildWorld, { type Entity } from "~/components/guild/guild-world";
import useLoading from "~/hooks/use-loading.hook";
import useSocket from "~/hooks/use-socket.hook";
import { getRequest } from "~/request";

export default function Dashboard() {
  const location = useLocation();
  const guildCode = location.pathname.split("/")[4];

  const [guild, setGuild] = useState<any>(null);
  const [memberDic, setMemberDic] = useState<
    Record<
      string,
      {
        userId: number;
        userCode: string;
        displayName?: string;
        role: string;
        iconPath?: string;
      }
    >
  >({});
  const [loading, setLoading] = useLoading();

  const { isConnected, sendMessage } = useSocket();

  const setInitialData = (data: any) => {
    setGuild(data.guild);
    setMemberDic(
      data.members.reduce((acc: any, member: any) => {
        acc[member.userCode] = member;
        return acc;
      }, {}),
    );
  };

  const fetchGuildData = async () => {
    // Fetch guild data here if needed
    setLoading(true);
    try {
      const res = await getRequest(`/guild/code/${guildCode}`);
      if (res.status === 200 && res.data) {
        setInitialData(res.data.responseObject);
      }
    } catch (error) {
      console.error("Error fetching guild data:", error);
      // nav("/game");
    }
    //setLoading(false);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    fetchGuildData();
  }, [guildCode]);

  useEffect(() => {
    if (!isConnected) return;
    sendMessage("USER_JOIN_GUILD");
  }, [isConnected, guild]);

  return (
    <>
      <div className="guild-dashboard">
        <div className="guild-dashboard-header">
          <GuildHeader
            guildId={guild ? guild.id : 0}
            guildCode={guildCode}
            guildName={guild ? guild.name : ""}
          />
        </div>
        <div className="guild-dashboard-leftside no-scrollbar">
          <GuildMemberList
            guildId={guild ? guild.id : 0}
            guildCode={guildCode}
            guildName={guild ? guild.name : ""}
          />
        </div>
        <div className="guild-dashboard-mainside no-scrollbar whitespace-pre-wrap">
          <GuildChat
            guildId={guild ? guild.id : 0}
            guildCode={guildCode}
            guildName={guild ? guild.name : ""}
            memberDic={memberDic}
            createdAt={guild ? new Date(guild.createdAt) : new Date()}
          />
        </div>
        <div className="guild-dashboard-subside no-scrollbar whitespace-pre-wrap">
          <GuildRefs />
        </div>
        <div className="guild-dashboard-rightside no-scrollbar">
          <GuildWorld guildId={guild ? guild.id : 0} guildCode={guildCode} />
        </div>
      </div>
      {loading}
    </>
  );
}
