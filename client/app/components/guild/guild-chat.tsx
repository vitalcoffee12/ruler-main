import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { InputField } from "../forms";
import Markdown from "react-markdown";
import { memo } from "react";

export interface GuildChatMessage {
  isGm: boolean;
  userId: string;
  icon: string;
  author: string;
  content: string;
  timestamp: string;
  quotes: { content: string; id: string }[];
  changes?: string;
}

export default function GuildChat(props: {
  messages: GuildChatMessage[];
  guildId: string;
}) {
  return (
    <div className="guild-chat">
      <MessageList messages={props.messages} />
      <div className="guild-chat-input">
        <div className="guild-chat-tag mb-2">
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
        </div>
        <div className="flex items-center rounded-md bg-white outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2 sm:text-sm/6 outline-stone-300 focus-within:outline-stone-600 border border-stone-300 h-10 w-full">
          <input
            type="text"
            placeholder="Type a message..."
            className="block min-w-0 grow bg-white ml-3 text-base focus:outline-none sm:text-sm/6"
          />
          <button className="flex items-center justify-center hover:bg-stone-100 w-12 h-full cursor-pointer">
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
  messages: GuildChatMessage[];
}) {
  return (
    <div className="guild-chat-messages no-scrollbar box-sizing-border">
      {props.messages.map((msg, index) => (
        <MessageItem
          key={index}
          isGm={msg.isGm}
          userId={msg.userId}
          icon={msg.icon}
          author={msg.author}
          content={msg.content}
          timestamp={msg.timestamp}
          quotes={msg.quotes}
          changes={msg.changes}
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
          <img src={props.icon} alt={props.author} />
        </div>
        <div className="pr-3">
          <div className="mb-1 text-stone-500 text-sm">{props.author}</div>
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
                  props.changes ? "hover:bg-stone-300" : ""
                }`}
                style={{
                  fontSize: "16px",
                  color: props.changes
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
            {props.quotes &&
              props.quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="relative border-l-4 border-stone-300 px-3 text-stone-600 italic mt-3 pr-30 py-2"
                  title={`show original rule #${quote.id}`}
                >
                  <div className="absolute top-4 right-0 py-1 px-2 bg-lime-200 text-lime-800 text-xs rounded-md top-0 -translate-y-1/2 hover:bg-lime-300 cursor-pointer">
                    {quote.id}
                  </div>
                  <Markdown>{quote.content}</Markdown>
                </div>
              ))}
          </div>
          <div className="text-stone-500 text-sm flex justify-end">
            {props.timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}

const taggedNodes = ["node-1", "node-3", "node-5"];
