import { getRequest } from "~/request";
import type { Guild } from "../common.interface";
import { use, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import "./_guild.css";

export default function GuildKnowledgeBase(props: { guild: Guild }) {
  const [type, setType] = useState<"ruleSet" | "termSet">("ruleSet");
  const [maxPage, setMaxPage] = useState(1);
  const [page, setPage] = useState<Record<string, number>>({
    ruleSet: 1,
    termSet: 1,
  });
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const highlighterRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<Record<string, HTMLLIElement>>({});

  const fetchGuildKnowledgeBase = async () => {
    const response = await getRequest(`/resource/guild`, {
      type: type,
      code: props.guild.code,
      page: page[type],
      search: search,
    });
    setData(response.data.responseObject.data || []);
    setMaxPage(response.data.responseObject.maxPage || 1);
  };

  useEffect(() => {
    if (!props.guild.code) return;
    fetchGuildKnowledgeBase();
  }, [props.guild.code]);

  useEffect(() => {
    if (!props.guild.code) return;
    fetchGuildKnowledgeBase();
  }, [page, type]);

  useEffect(() => {
    const selectedRef =
      typeRef.current[type === "ruleSet" ? "Documents" : "Terms"];

    if (selectedRef && highlighterRef.current) {
      highlighterRef.current.style.width = `${selectedRef.offsetWidth}px`;
      highlighterRef.current.style.height = `${selectedRef.offsetHeight}px`;
      highlighterRef.current.style.transform = `translateX(${selectedRef.offsetLeft}px)`;
      highlighterRef.current.style.transition = `transform 0.12s ease-in-out, width 0.12s ease-in-out`;
    }
  }, [type]);

  return (
    <div className="p-4 grid grid-rows-[auto_auto_auto_1fr_50px] gap-2 h-full box-border">
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
        <ul className="relative flex rounded-md bg-white p-1 text-sm shadow-sm no-select">
          <div
            className="absolute bg-lime-100 rounded-md transition duration-120 top-1 left-0 h-full z-0"
            ref={highlighterRef}
          ></div>
          {subItems.map((item) => (
            <li
              key={item}
              className={`p-2 cursor-pointer rounded-md transition duration-200 z-1 ${
                (type === "ruleSet" && item === "Documents") ||
                (type === "termSet" && item === "Terms")
                  ? "text-lime-800"
                  : "text-stone-800"
              }`}
              ref={(el) => {
                if (el) typeRef.current[item] = el;
              }}
              onClick={() => {
                setType(item === "Documents" ? "ruleSet" : "termSet");
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative row-start-3 row-end-4 bg-white rounded-md border border-stone-300 text-sm flex items-center gap-1 outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2 sm:text-sm/6 outline-stone-300 focus-within:outline-stone-600 border border-stone-300 w-full">
        <input
          type="text"
          placeholder={`Search in ${type === "ruleSet" ? "Documents" : "Terms"}...`}
          className="w-full px-3 py-2 rounded-md focus:outline-none focus:outline-none "
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              console.log("Searching for:", search);
            }
          }}
          value={search}
        />
        <div
          className="material-symbols-outlined p-1.5 no-select cursor-pointer text-stone-400 hover:text-stone-600 
          hover:bg-stone-100 transition duration-200 rounded-full"
          onClick={() => setSearch("")}
          style={{
            fontSize: "14px",
            visibility: search.length > 0 ? "visible" : "hidden",
          }}
        >
          close
        </div>
        <div className="material-symbols-outlined no-select cursor-pointer text-stone-400 p-2 hover:text-stone-600 hover:bg-stone-100 transition duration-200 ">
          search
        </div>
      </div>
      <div className="min-h-full overflow-y-auto no-scrollbar rounded-md bg-white row-start-4 row-end-5 shadow-sm">
        {showItems({ type, data })}
      </div>
      <div className="min-h-full overflow-y-auto row-start-5 row-end-6 flex justify-center items-center">
        <ul className="flex items-center gap-4 text-stone-600  no-select">
          <li
            className="material-symbols-outlined cursor-pointer active:scale-95"
            onClick={() => {
              setPage((prev) => ({
                ...prev,
                [type]: prev[type] > 1 ? prev[type] - 1 : prev[type],
              }));
            }}
          >
            arrow_back
          </li>
          {` Page ${page[type]} of ${maxPage} `}
          <li
            className="material-symbols-outlined cursor-pointer active:scale-95"
            onClick={() => {
              setPage((prev) => ({
                ...prev,
                [type]: prev[type] < maxPage ? prev[type] + 1 : prev[type],
              }));
            }}
          >
            arrow_forward
          </li>
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
