import type { Guild } from "../common.interface";
import { use, useContext, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import "./_guild.css";
import { AuthContext } from "~/contexts/authContext";
import useRequest from "~/hooks/use-request.hook";

export default function GuildKnowledgeBase(props: { guild: Guild }) {
  const [data, setData] = useState<any[]>([]);
  const reqKnowledgeBase = useRequest(
    `/guild/aggregate/${props.guild.code}`,
    "get",
  );

  const fetchGuildKnowledgeBase = async () => {
    if (!props.guild.code) return;
    const res = await reqKnowledgeBase.sendRequest({
      authorized: false,
    });

    if (res && res.status === 200) {
      setData(res.data.responseObject || []);
      console.log("Fetched guild knowledge base:", res.data.responseObject);
    }
  };

  useEffect(() => {
    if (!props.guild.code) return;
    fetchGuildKnowledgeBase();
  }, [props.guild.code]);

  return (
    <div className="p-4 grid grid-rows-[auto_auto_auto_1fr_50px] gap-2 h-full box-border overflow-auto">
      <h2 className="text-lg flex justify-between items-center mb-4">
        <span className="playwrite-font mr-2 font-semibold">
          {props.guild.name} Knowledge Base
        </span>
        <span
          className="material-symbols-outlined p-2 cursor-pointer text-stone-500 hover:text-stone-900 transition duration-200 text-sm"
          onClick={fetchGuildKnowledgeBase}
        >
          refresh
        </span>
      </h2>
      <div>
        <ul>
          {data.map((item, index) => (
            <li key={index} className="mb-4 ">
              <div className="text-md flex gap-2 items-center text-stone-800 font-medium mb-1">
                <div className="text-sm p-1 bg-stone-200 rounded">
                  {index + 1}
                </div>
                <div>{item.responseTime}</div>
                <div>{item.message}</div>
              </div>
              <div className="text-sm text-stone-600 mt-1 border-b border-stone-200 pb-2">
                {item.intents.map((intent: any, idx: number) => (
                  <div key={idx} className="mb-1">
                    {intent.type} : <span>{intent.target}</span>
                  </div>
                ))}
              </div>
              <div className="text-sm text-stone-600 mt-1 border-b border-stone-200 pb-2">
                {item.memories.map((memory: any, idx: number) => (
                  <div key={idx} className="mb-1">
                    {memory.target} : <span>{memory.memory}</span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function showItems({
  type,
  data,
}: {
  type: string;
  data: Record<string, any>[];
}) {
  if (type === "ruleSet") {
    return (
      <>
        {data.map((item, index) => (
          <KnowledgeBaseItemRule key={index} item={item} />
        ))}
      </>
    );
  } else if (type === "termSet") {
    return (
      <>
        {data.map((item, index) => (
          <KnowledgeBaseItemTerm key={index} item={item} />
        ))}
      </>
    );
  }
}

function KnowledgeBaseItemTerm(props: { item: Record<string, any> }) {
  if (!props.item || !props.item.term) {
    return <></>;
  }
  const term = props.item.term
    .split(" ")
    .map((w: string) => {
      if (w.length === 0) return w;
      w = w.toLowerCase();
      w = w[0].toUpperCase() + w.slice(1);
      return w;
    })
    .join(" ");

  return (
    <>
      <div
        className="relative border-b border-stone-200 p-4"
        title={`item ${props.item.id}: ${term} `}
      >
        <div className="font-semibold text-stone-800 mb-2 flex items-center gap-2 rounded-md">
          <div>{term}</div>
        </div>
        <div className="text-sm text-stone-600">{props.item.description}</div>
      </div>
    </>
  );
}

function KnowledgeBaseItemRule(props: { item: Record<string, any> }) {
  const [expanded, setExpanded] = useState(false);
  const categories = props.item.categories || [];

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      if (expanded) {
        ref.current.style.display = `block`;
        ref.current.style.opacity = `1`;
        ref.current.style.maxHeight = `${ref.current.scrollHeight}px`;
      } else {
        ref.current.style.maxHeight = `0px`;
        ref.current.style.opacity = `0`;
        setTimeout(() => {
          if (ref.current) {
            ref.current.style.display = `none`;
          }
        }, 200);
      }
    }

    return () => {};
  }, [expanded]);

  if (!props.item || !props.item.content || !props.item.content.length) {
    return <></>;
  }

  return (
    <div
      className="relative border-b border-stone-200 p-4"
      title={`item ${props.item.id}: ${props.item.title} `}
    >
      <div className="relative">
        {/* <div
          ref={catPrevRef}
          className="absolute material-symbols-outlined bg-white p-1 drop-shadow-sm rounded-full left-0 top-1/2 -translate-y-1/2 text-stone-400 cursor-pointer"
          style={{ display: "none" }}
        >
          arrow_left
        </div> */}
        {categories && (
          <div className="mb-3 overflow-y-hidden flex items-center min-w-full no-scrollbar">
            {categories.map((cat: string, idx: number) => {
              let splitter = <></>;
              if (idx != categories.length - 1) {
                splitter = (
                  <span className="text-stone-400 material-symbols-outlined">
                    arrow_right
                  </span>
                );
              }
              return (
                <div key={idx} className="items-center w-auto inline-flex">
                  <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full inline-block whitespace-nowrap">
                    {cat}
                  </span>
                  {splitter}
                </div>
              );
            })}
          </div>
        )}
        {/* <div
          ref={catNextRef}
          className="absolute material-symbols-outlined bg-white p-1 drop-shadow-sm rounded-full right-0 top-1/2 -translate-y-1/2 text-stone-400 cursor-pointer"
          style={{ display: "none" }}
        >
          arrow_right
        </div> */}
      </div>
      <div className="font-semibold text-stone-800 mb-2 flex items-center gap-2 rounded-md">
        <div>{props.item.title}</div>
      </div>
      <div className="text-sm text-stone-600">{props.item.summary}</div>
      <div>
        {props.item.content && props.item.content.length > 0 && (
          <>
            <div className="flex items-center mt-3 text-stone-500 text-sm no-select">
              <h3>Contents</h3>
              <span
                className="material-symbols-outlined cursor-pointer transition duration-200"
                style={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
                onClick={() => setExpanded(!expanded)}
              >
                keyboard_arrow_down
              </span>
            </div>
            <div
              className="overflow-hidden transition-all duration-200 none max-h-0 opacity-0"
              ref={ref}
            >
              <div className="text-sm leading-6 bg-stone-50 rounded-md text-stone-700 p-4 mt-2">
                <Markdown>{props.item.content.join(" ")}</Markdown>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const subItems = ["Documents", "Terms"];
