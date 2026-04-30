import { useEffect, useRef, useState } from "react";
import useSocket from "~/hooks/use-socket.hook";
import type { GameHistory, Guild, GuildChatMessage } from "../common.interface";
import { MessageList } from "./guild-chat-message";
import useToast from "~/hooks/use-toast.hook";
import { BASE_URL } from "~/axios-instance";

export default function GuildChat(props: {
  guild: Guild;
  memberDic?: Record<
    string,
    {
      userId: number;
      userCode: string;
      color: string;
      displayName?: string;
      role: string;
      iconPath?: string;
    }
  >;
}) {
  const chatRef = useRef<HTMLDivElement>(null);
  const { payloads, isConnected, sendMessage } = useSocket();

  const [message, setMessage] = useState<string>("");
  const [histories, setHistories] = useState<GameHistory[]>([]);
  const [taggedNodes, setTaggedNodes] = useState<string[]>([]);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);

  const [rows, setRows] = useState<number>(1);
  const [toast, addToast] = useToast();

  const onSendMessage = (message: string) => {
    if (isWaiting) {
      addToast("warning", "GM's thingking...Please wait...");
      return;
    }
    sendMessage("GUILD_CHAT_MESSAGE", { message, entities: taggedNodes });
    setMessage("");
    setIsWaiting(true);
    setRows(1);
  };

  useEffect(() => {
    if (!isConnected) return;
    for (const payload of payloads) {
      if (
        payload.type === "GUILD_CHAT_UPDATE" &&
        payload.guildCode === props.guild.code
      ) {
        setHistories(payload.content);
      }
      // if (
      //   payload.type === "GUILD_HISTORY_UPDATE" &&
      //   payload.guildCode === props.guild.code
      // ) {
      //   setHistories(payload.content);
      // }
      if (
        payload.type === "GUILD_FLAG_DOWN" &&
        payload.guildCode === props.guild.code
      ) {
        setIsWaiting(false);
      }
      if (
        payload.type === "GUILD_FLAG_WAITING" &&
        payload.guildCode === props.guild.code
      ) {
        setIsWaiting(true);
      }
    }
  }, [isConnected, payloads, props.guild.code]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [histories]);
  // const onFalgup = () => {
  //   sendMessage("GUILD_FLAG_UP", {});
  // };

  return (
    <div className="guild-chat">
      <div
        className="guild-chat-messages no-scrollbar box-sizing-border"
        ref={chatRef}
      >
        <MessageList
          messages={mapHistoriesToMessages(histories, props.memberDic)}
        />
      </div>
      <div className="guild-chat-input">
        <div className="mb-2 flex items-center justify-between">
          <ul className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {taggedNodes.map((node) => (
              <li
                key={node}
                className="flex items-center bg-stone-200 text-stone-700 rounded-lg  text-xs whitespace-nowrap px-3 py-1"
              >
                {node}
                <span
                  className="material-symbols-outlined ml-2 cursor-pointer hover:text-stone-900"
                  style={{ fontSize: "12px" }}
                >
                  close
                </span>
              </li>
            ))}
            <li className="cursor-pointer hover:text-stone-900 bg-stone-200 rounded-full p-1 w-5 h-5 flex items-center justify-center">
              <span
                className="material-symbols-outlined "
                style={{ fontSize: "12px" }}
              >
                add
              </span>
            </li>
          </ul>
          <div className="flex items-center gap-3">
            {isWaiting && (
              <span className="text-lime-600 text-sm">
                Waiting for GM's response...
              </span>
            )}
          </div>
        </div>
        <div
          className="grid rounded-md bg-white outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2 sm:text-sm/6 outline-stone-300 focus-within:outline-stone-600 border border-stone-300 w-full"
          style={{
            height: `calc(var(--spacing) * ${rows} + 10)`,
            gridTemplateColumns: "1fr calc(var(--spacing) * 10)",
          }}
        >
          <textarea
            placeholder="Type a message..."
            rows={rows}
            className="block min-w-0 grow bg-white ml-3 text-base focus:outline-none sm:text-sm/6 no-scrollbar resize-none m-2 transition duration-200"
            onChange={(e) => {
              const enter = e.target.value.split("\n").length;
              setRows(enter < 5 ? enter : 5);
              setMessage(e.target.value);
            }}
            value={message}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setRows(rows < 5 ? rows + 1 : 5);
              }
              if (e.altKey && e.key === "Enter") {
                e.preventDefault();
                onSendMessage(message);
              }
              if (e.key === "Backspace" && message.endsWith("\n")) {
                setRows(rows > 1 ? rows - 1 : 1);
              }
            }}
          />
          <button
            className={`flex items-center justify-center  transition duration-200  outline-none ${isWaiting ? "bg-stone-100" : "focus:bg-lime-200 hover:bg-stone-100 cursor-pointer"}`}
            onClick={() => {
              onSendMessage(message);
            }}
            title="Alt + Enter"
          >
            <span
              className={`material-symbols-outlined `}
              style={{ color: isWaiting ? "#aaa" : "#010101" }}
            >
              send
            </span>
          </button>
        </div>
      </div>
      {toast}
    </div>
  );
}

function mapHistoriesToMessages(
  histories: GameHistory[],
  memberDic?: Record<
    string,
    {
      userId: number;
      userCode: string;
      color: string;
      displayName?: string;
      role: string;
      iconPath?: string;
      tasks?: string;
    }
  >,
): GuildChatMessage[] {
  const historiesMap = histories.map((history) => {
    const memberInfo = memberDic ? memberDic[history.chat.userCode] : undefined;
    let type = "PLAYER";
    switch (history.chat.userId) {
      case 0:
        type = "GUILD";
        break;
      case -1:
        type = "SYSTEM";
        break;
      default:
        type = "PLAYER";
        break;
    }

    return {
      _id: history._id,
      type: type,
      color: memberInfo?.color ?? "#cecece",
      userId: history.chat.userId,
      userCode: history.chat.userCode,
      iconPath: memberInfo?.iconPath
        ? `url(${BASE_URL}/${memberInfo.iconPath})`
        : undefined,
      displayName: memberInfo
        ? memberInfo.displayName || "Unknown User"
        : "Unknown User",
      content: history.chat.message,
      timestamp: history.createdAt,
      citations: history.citations,
      entities: history.entities,
      tasks:
        history.tasks?.find((v) => v.type == "generate_summary")?.output ?? "",
    };
  });

  //console.log("Mapped histories to messages:", historiesMap);

  return historiesMap;
}
