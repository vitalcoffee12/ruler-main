import { getRequest } from "~/request";
import type { Guild } from "../common.interface";
import { useEffect, useRef, useState } from "react";

export default function GuildKnowledgeBase(props: { guild: Guild }) {
  const [type, setType] = useState<"ruleSet" | "termSet">("ruleSet");
  const [maxPage, setMaxPage] = useState(1);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<Record<string, HTMLLIElement>>({});

  const fetchGuildKnowBase = async () => {
    const response = await getRequest(`/resource/guild`, {
      type: type,
      code: props.guild.code,
      page: page,
    });
    setData(response.data.responseObject.data || []);
    setMaxPage(response.data.responseObject.maxPage || 1);
  };

  useEffect(() => {
    fetchGuildKnowBase();
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
    <div className="p-4 grid grid-rows-[auto_auto_1fr_50px] gap-2 h-full box-border">
      <h2 className="text-lg flex justify-between items-center mb-4">
        <span className=" playwrite-font mr-2 font-semibold ">
          {props.guild.name} Knowledge Base
        </span>
        <span
          className="material-symbols-outlined p-2 cursor-pointer text-stone-500 hover:text-stone-900 transition duration-200 text-sm"
          onClick={fetchGuildKnowBase}
        >
          refresh
        </span>
      </h2>
      <div>
        <ul className="relative flex rounded-md bg-white p-1 text-sm shadow-sm">
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
                setPage(1);
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="min-h-full overflow-y-auto no-scrollbar rounded-md bg-white row-start-3 row-end-4 shadow-sm"></div>
      <div className="min-h-full overflow-y-auto row-start-4 row-end-5 flex justify-center items-center">
        <ul className="flex items-center gap-4 text-stone-600  no-select">
          <li
            className="material-symbols-outlined cursor-pointer active:scale-95"
            onClick={() => {
              setPage(page > 1 ? page - 1 : page);
            }}
          >
            arrow_back
          </li>
          {` Page ${page} of ${maxPage} `}
          <li
            className="material-symbols-outlined cursor-pointer active:scale-95"
            onClick={() => {
              setPage(page < maxPage ? page + 1 : page);
            }}
          >
            arrow_forward
          </li>
        </ul>
      </div>
    </div>
  );
}

function KnowledgeBaseItem(props: Record<string, any>) {
  return (
    <div className="border-b border-stone-200 p-4 hover:bg-stone-50 cursor-pointer transition duration-200">
      <div className="font-semibold text-stone-800 mb-2">{props.title}</div>
      <div className="text-sm text-stone-600">{props.description}</div>
    </div>
  );
}

const subItems = ["Documents", "Terms"];
