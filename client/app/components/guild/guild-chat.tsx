import { useEffect, useRef, useState } from "react";
import useSocket from "~/hooks/use-socket.hook";
import type { GameHistory, Guild, GuildChatMessage } from "../common.interface";
import { IntroMessage, MessageList } from "./guild-chat-message";

export default function GuildChat(props: {
  guild: Guild;
  memberDic?: Record<
    string,
    {
      userId: number;
      userCode: string;
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
  const [flagged, setFlagged] = useState<boolean>(false);
  const [flagCount, setFlagCount] = useState<number>(0);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);

  const [rows, setRows] = useState<number>(1);

  const onSendMessage = (message: string) => {
    sendMessage("GUILD_CHAT_MESSAGE", { message, entities: taggedNodes });
    setMessage("");
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
      if (
        payload.type === "GUILD_HISTORY_UPDATE" &&
        payload.guildCode === props.guild.code
      ) {
        setHistories(payload.content.gameHistories);
      }
      if (
        payload.type === "GUILD_FLAG_DOWN" &&
        payload.guildCode === props.guild.code
      ) {
        setFlagged(false);
        setIsWaiting(false);
        setFlagCount(0);
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
  const onFalgup = () => {
    sendMessage("GUILD_FLAG_UP", {});
  };

  return (
    <div className="guild-chat">
      <div
        className="guild-chat-messages no-scrollbar box-sizing-border"
        ref={chatRef}
      >
        <div>
          <IntroMessage guild={props.guild} />
        </div>
        <div className="w-full border-b border-stone-200 mb-2 mt-2" />
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
            <span className="text-stone-500 text-sm">
              {flagCount} / {3}
            </span>
            {isWaiting && (
              <span className="text-lime-600 text-sm">
                Waiting for Ruler's response...
              </span>
            )}
            {!isWaiting && (
              <button
                className={`flex items-center text-stone-700 rounded-md pl-2 pr-3 py-1 text-sm cursor-pointer transition duration-200 ${
                  flagged
                    ? "bg-lime-300 hover:bg-lime-400"
                    : "bg-stone-200 hover:bg-stone-300"
                }`}
                onClick={() => {
                  if (isWaiting) return;
                  setFlagged(true);
                  setFlagCount((prev) => prev + 1);
                  onFalgup();
                }}
              >
                <span
                  className="material-symbols-outlined mr-2 mb-0.5"
                  style={{ fontSize: "16px" }}
                >
                  {flagged ? "check_box" : "check_box_outline_blank"}
                </span>
                Ready
              </button>
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
            className="flex items-center justify-center hover:bg-stone-100 cursor-pointer transition duration-200 focus:bg-lime-200 outline-none"
            onClick={() => {
              onSendMessage(message);
            }}
            title="Alt + Enter"
          >
            <span className="material-symbols-outlined text-stone-700">
              send
            </span>
          </button>
        </div>
      </div>
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
      displayName?: string;
      role: string;
      iconPath?: string;
    }
  >,
): GuildChatMessage[] {
  return histories.map((history) => {
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
      userId: history.chat.userId,
      userCode: history.chat.userCode,
      iconPath: memberInfo
        ? memberInfo.iconPath || "https://picsum.photos/400"
        : "https://picsum.photos/400",
      displayName: memberInfo
        ? memberInfo.displayName || "Unknown User"
        : "Unknown User",
      content: history.chat.message,
      timestamp: history.createdAt,
      citations: history.citations,
      entities: history.entities,
    };
  });
}
