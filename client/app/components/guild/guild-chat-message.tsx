import { memo } from "react";
import type { Guild, GuildChatMessage } from "../common.interface";
import Markdown from "react-markdown";

export const MessageList = memo(function MessageList(props: {
  messages: GuildChatMessage[];
}) {
  return (
    <>
      {props.messages.map((msg, index) => {
        if (msg.type === "GUILD") {
          return <MessageTypeGuild key={msg._id} message={msg} />;
        } else if (msg.type === "PLAYER") {
          return <MessageTypePlayer key={msg._id} message={msg} />;
        } else if (msg.type === "SYSTEM") {
          return <MessageTypeSystem key={msg._id} message={msg} />;
        }
      })}
    </>
  );
});

function MessageTypeGuild(props: { message: GuildChatMessage }) {
  return (
    <div className="chat-message hover:bg-stone-100 p-3 rounded-lg transition duration-200">
      <div className="grid grid-cols-[calc(var(--spacing)*13)_1fr] gap-1">
        <div className="w-10 h-10 rounded-full overflow-hidden inline-block align-top mt-1">
          <img
            src={props.message.iconPath}
            alt={"Guild Icon"}
            className="w-10 h-10 object-cover"
          />
        </div>
        <div className="pr-3">
          <div className="mb-1 text-stone-500 text-sm">
            <span
              className="material-symbols-outlined mr-1"
              style={{
                fontSize: "1rem",
                verticalAlign: "middle",
              }}
            >
              smart_toy
            </span>
            {props.message.displayName}
          </div>
          <div className="relative rounded mb-1 whitespace-pre-wrap pr-30">
            <div
              className="material-symbols-outlined absolute right-10 py-1 px-2 bg-stone-200 text-stone-600 text-xs rounded-md top-0 -translate-y-1/2 hover:bg-stone-300 cursor-pointer"
              style={{ fontSize: "16px" }}
              title="re-generate message"
            >
              rotate_left
            </div>

            <div
              className={`material-symbols-outlined absolute right-0 py-1 px-2 bg-stone-200 text-xs rounded-md top-0 -translate-y-1/2  cursor-pointer ${
                props.message.entities ? "hover:bg-stone-300" : ""
              }`}
              style={{
                fontSize: "16px",
                color: props.message.entities
                  ? `var(--color-stone-600)`
                  : `var(--color-stone-400)`,
              }}
              title="show edit history"
            >
              menu
            </div>
            <Markdown>{props.message.content}</Markdown>
          </div>

          <div>
            {props.message.citations &&
              props.message.citations.map((citation) => (
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
            {new Date(props.message.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
function MessageTypePlayer(props: { message: GuildChatMessage }) {
  return (
    <div className="chat-message hover:bg-stone-100 p-3 rounded-lg transition duration-200">
      <div className="grid grid-cols-[calc(var(--spacing)*13)_1fr] gap-1">
        <div className="w-10 h-10 rounded-full overflow-hidden inline-block align-top mt-1">
          <img
            src={props.message.iconPath}
            alt={props.message.displayName}
            className="w-10 h-10 object-cover"
          />
        </div>
        <div className="pr-3">
          <div className="mb-1 text-stone-500 text-sm">
            {props.message.displayName}
          </div>
          <div className="relative rounded mb-1 whitespace-pre-wrap pr-30">
            {props.message.type === "GUILD" && (
              <div
                className="material-symbols-outlined absolute right-10 py-1 px-2 bg-stone-200 text-stone-600 text-xs rounded-md top-0 -translate-y-1/2 hover:bg-stone-300 cursor-pointer"
                style={{ fontSize: "16px" }}
                title="re-generate message"
              >
                rotate_left
              </div>
            )}
            {props.message.type === "GUILD" && (
              <div
                className={`material-symbols-outlined absolute right-0 py-1 px-2 bg-stone-200 text-xs rounded-md top-0 -translate-y-1/2  cursor-pointer ${
                  props.message.entities ? "hover:bg-stone-300" : ""
                }`}
                style={{
                  fontSize: "16px",
                  color: props.message.entities
                    ? `var(--color-stone-600)`
                    : `var(--color-stone-400)`,
                }}
                title="show edit history"
              >
                menu
              </div>
            )}
            <Markdown>{props.message.content}</Markdown>
          </div>

          <div>
            {props.message.citations &&
              props.message.citations.map((citation) => (
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
            {new Date(props.message.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageTypeSystem(props: { message: GuildChatMessage }) {
  return (
    <div className="chat-message mx-20 py-3 text-stone-500 italic border-b border-stone-200 text-center">
      <div className="pr-3">
        <div className="w-full text-sm">
          {props.message.content}
          <div className="text-xs mt-1 text-stone-400">
            {new Date(props.message.timestamp).toLocaleString()}
          </div>
        </div>
        <div className="text-stone-500 text-sm flex justify-end"></div>
      </div>
    </div>
  );
}

export function IntroMessage(props: { guild: Guild }) {
  return (
    <MessageTypePlayer
      message={{
        _id: "intro",
        content: `## Congratulations, \`${props.guild.name}\` has been created!
This is the beginning of your guild chat. Guild members can communicate here, adventure the world, and \`Ruler\` will take a job in guiding your journey!`,
        citations: [],
        entities: [],
        displayName: props.guild.name,
        iconPath: props.guild.iconPath || "https://picsum.photos/400",
        type: "PLAYER",
        timestamp: props.guild.createdAt,
        userCode: "",
        userId: 0,
      }}
    />
  );
}
