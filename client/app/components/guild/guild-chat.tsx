import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { InputField } from "../forms";
import Markdown from "react-markdown";
import { memo, useContext, useEffect, useState } from "react";
import useSocket from "~/hooks/use-socket.hook";
import { UserContext } from "~/contexts/userContext";

export interface GameHistory {
  _id: string;
  sceneId: number;
  chat: { userId: number; userCode: string; message: string };
  createdAt: string;
  entities: any[];
  citations: any[];
}

export interface GuildChatMessage {
  _id: string;
  isGm: boolean;
  userId: number;
  userCode: string;
  iconPath: string;
  displayName: string;
  content: string;
  timestamp: string;
  citations: { content: string; ruleId: number; description?: string }[];
  entities: any[];
}

export default function GuildChat(props: {
  guildId: number;
  guildCode: string;
  guildName: string;
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
  createdAt: Date;
}) {
  const user = useContext(UserContext);
  const { payloads, isConnected, sendMessage } = useSocket();

  const [message, setMessage] = useState<string>("");
  const [histories, setHistories] = useState<GameHistory[]>([]);
  const [taggedNodes, setTaggedNodes] = useState<string[]>([]);
  const [flagged, setFlagged] = useState<boolean>(false);
  const [flagCount, setFlagCount] = useState<number>(0);

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
        payload.guildCode === props.guildCode
      ) {
        setHistories(payload.content.gameHistories);
      }
    }
  }, [isConnected, payloads, props.guildCode]);

  return (
    <div className="guild-chat">
      <MessageList
        guildName={props.guildName}
        createdAt={props.createdAt}
        messages={mapHistoriesToMessages(histories, props.memberDic)}
      />
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
            <button
              className={`flex items-center text-stone-700 rounded-md pl-2 pr-3 py-1 text-sm cursor-pointer transition duration-200 ${
                flagged
                  ? "bg-lime-300 hover:bg-lime-400"
                  : "bg-stone-200 hover:bg-stone-300"
              }`}
              onClick={() => setFlagged(!flagged)}
            >
              <span
                className="material-symbols-outlined mr-2 mb-0.5"
                style={{ fontSize: "16px" }}
              >
                {flagged ? "check_box" : "check_box_outline_blank"}
              </span>
              Ready
            </button>
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

const MessageList = memo(function MessageList(props: {
  guildName: string;
  createdAt: Date;
  messages: GuildChatMessage[];
}) {
  return (
    <div className="guild-chat-messages no-scrollbar box-sizing-border">
      <div>{introMessage(props.guildName, props.createdAt)}</div>
      <div className="w-full border-b border-stone-200 mb-2 mt-2" />
      {props.messages.map((msg, index) => (
        <MessageItem
          key={msg._id}
          _id={msg._id}
          isGm={msg.isGm}
          userId={msg.userId}
          userCode={msg.userCode}
          iconPath={msg.iconPath}
          displayName={msg.displayName}
          content={msg.content}
          timestamp={msg.timestamp}
          citations={msg.citations}
          entities={msg.entities}
        />
      ))}
    </div>
  );
});

function MessageItem(props: GuildChatMessage) {
  return (
    <div className="chat-message hover:bg-stone-100 p-3 rounded-lg transition duration-200">
      <div className="grid grid-cols-[calc(var(--spacing)*13)_1fr] gap-1">
        <div className="w-10 h-10 rounded-full overflow-hidden inline-block align-top mt-1">
          <img
            src={props.iconPath}
            alt={props.displayName}
            className="w-10 h-10 object-cover"
          />
        </div>
        <div className="pr-3">
          <div className="mb-1 text-stone-500 text-sm">{props.displayName}</div>
          <div className="relative rounded mb-1 whitespace-pre-wrap pr-30">
            {props.isGm && (
              <div
                className="material-symbols-outlined absolute right-10 py-1 px-2 bg-stone-200 text-stone-600 text-xs rounded-md top-0 -translate-y-1/2 hover:bg-stone-300 cursor-pointer"
                style={{ fontSize: "16px" }}
                title="re-generate message"
              >
                rotate_left
              </div>
            )}
            {props.isGm && (
              <div
                className={`material-symbols-outlined absolute right-0 py-1 px-2 bg-stone-200 text-xs rounded-md top-0 -translate-y-1/2  cursor-pointer ${
                  props.entities ? "hover:bg-stone-300" : ""
                }`}
                style={{
                  fontSize: "16px",
                  color: props.entities
                    ? `var(--color-stone-600)`
                    : `var(--color-stone-400)`,
                }}
                title="show edit history"
              >
                menu
              </div>
            )}
            {props.isGm && <Markdown>{props.content}</Markdown>}
            {!props.isGm && props.content}
          </div>

          <div>
            {props.citations &&
              props.citations.map((citation) => (
                <div
                  key={citation.ruleId}
                  className="relative border-l-4 border-stone-300 px-3 text-stone-600 italic mt-3 pr-30 py-2"
                  title={`show original rule #${citation.ruleId}`}
                >
                  <div className="absolute top-4 right-0 py-1 px-2 bg-lime-200 text-lime-800 text-xs rounded-md top-0 -translate-y-1/2 hover:bg-lime-300 cursor-pointer">
                    {citation.ruleId}
                  </div>
                  <Markdown>{citation.content}</Markdown>
                </div>
              ))}
          </div>
          <div className="text-stone-500 text-sm flex justify-end">
            {new Date(props.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

const taggedNodes = ["node-1", "node-3", "node-5"];
const introMessage = (guildName: string, createdAt: Date) => (
  <MessageItem
    _id="intro"
    content={`## Congratulations, \`${guildName}\` has been created!
This is the beginning of your guild chat. Guild members can communicate here, adventure the world, and \`Ruler\` will take a job in guiding your journey!`}
    citations={[]}
    entities={[]}
    displayName={guildName}
    iconPath="https://picsum.photos/400"
    isGm={true}
    timestamp={createdAt.toISOString()}
    userCode=""
    userId={0}
  />
);

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
    return {
      _id: history._id,
      isGm: memberInfo?.userId === 0 ? true : false,
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
