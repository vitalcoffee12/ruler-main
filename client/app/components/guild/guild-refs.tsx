import Markdown from "react-markdown";
import type { Entity, Guild } from "../common.interface";
import { useState } from "react";

export default function GuildRefs(props: {
  guild: Guild;
  refType: string | null;
  world: Entity[];
  data: any;
}) {
  return (
    <>
      {(!props.refType || !props.data) && (
        <div className="guild-refs text-stone-500 p-4 flex flex-col items-center justify-center h-full min-h-full">
          No references selected.
        </div>
      )}
      {props.refType == "entity" && props.data && (
        <EntityRef key={props.data} world={props.world} name={props.data} />
      )}
    </>
  );
}

function EntityRef(props: { name: string; world: Entity[] }) {
  // const [inIsOpen, setInIsOpen] = useState<boolean>(true);
  // const [outIsOpen, setOutIsOpen] = useState<boolean>(true);
  const targetEntity = props.world?.find((e) => e.name === props.name);
  // const relatedEntitiesIn = props.world.filter((e) =>
  //   e.relations?.some((r) => r.name === targetEntity?.name),
  // );

  // const relatedEntitiesOut = props.world.filter((e) =>
  //   targetEntity?.relations?.some((r) => r.name === e.name),
  // );

  return (
    <>
      <div className="grid grid-rows-[auto_1fr] pb-7">
        <div className="p-2 m-2">
          <div
            className="flex gap-2 items-center border-b pb-1 border-stone-200"
            title="id"
          >
            <p title="name" className="text-lg">
              {targetEntity?.name}
              <span>
                {targetEntity?.type && (
                  <span
                    className="text-xs rounded bg-stone-100 p-1 text-stone-700 ml-2"
                    title={targetEntity.type}
                  >
                    {targetEntity.type}
                  </span>
                )}
              </span>
            </p>
          </div>
          <div className="text-sm text-stone-500 mt-2">
            location
            <div className="text-md p-1 text-stone-900 ml-2">
              {targetEntity?.location || "Unknown"}
            </div>
          </div>
          <div className="text-sm text-stone-500 mt-2">
            group
            <div className="text-md p-1 text-stone-900 ml-2">
              {targetEntity?.group || "Unknown"}
            </div>
          </div>
          <div className="text-sm text-stone-500 mt-2">
            route
            <div className="text-md p-1 text-stone-900 ml-2">
              {targetEntity?.route?.map((r, index) => (
                <div key={index}> {r} </div>
              )) || ""}
            </div>
          </div>
          <div className="text-sm text-stone-500 mt-2">
            appearance
            <div className="text-md p-1 text-stone-900 ml-2">
              {targetEntity?.appearance || "Unknown"}
            </div>
          </div>
          <div className="text-sm text-stone-500 mt-2">
            personality
            <div className="text-md p-1 text-stone-900 ml-2">
              {targetEntity?.personality || "Unknown"}
            </div>
          </div>
          <div className="text-sm text-stone-500 mt-2">
            backstory
            <div className="text-md p-1 text-stone-900 ml-2">
              {targetEntity?.backstory || "Unknown"}
            </div>
          </div>
          <div className="text-sm text-stone-500 mt-2">
            description
            <div className="text-md p-1 text-stone-900 ml-2">
              {targetEntity?.description || "Unknown"}
            </div>
          </div>
          <div className="text-sm text-stone-500 mt-2">
            related
            <div className="text-md p-1 text-stone-900 ml-2">
              {targetEntity?.related?.map((r, index) => (
                <div key={index}> {r} </div>
              )) || "Unknown"}
            </div>
          </div>

          <div className="text-sm text-stone-500 mt-2">
            memories
            <div className="text-md p-1 text-stone-900 ml-2">
              {targetEntity?.memory?.map((d, index) => (
                <div key={index}> {d} </div>
              )) || "Unknown"}
            </div>
          </div>

          <div className="p-2">
            {/* <Markdown>
              {Object.keys(targetEntity?.state || {})
                .map((key) => {
                  return `**${key}**: ${targetEntity?.state[key]}\n`;
                })
                .join("\n")}
            </Markdown> */}
          </div>
        </div>
        {/* <div className=" ">
          <div
            className="no-select flex justify-between cursor-pointer p-2 px-4 active:scale-99 transtion duration-200 bg-stone-100"
            onClick={() => {
              setInIsOpen(!inIsOpen);
            }}
          >
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-2">south_east</span>
              Inbound Relations
            </div>
            <span
              className="material-symbols-outlined"
              style={{
                transform: inIsOpen ? "" : "rotateX(180deg)",
              }}
            >
              keyboard_arrow_down
            </span>
          </div>
          <ul
            className="px-3 overflow-hidden transition duration-200 border-b border-stone-200 bg-stone-100"
            style={{
              height: inIsOpen ? "" : "0",
            }}
          >
            {relatedEntitiesIn.map((r) => (
              <>
                <li
                  className="rounded-lg shadow-md p-2 mb-3 bg-white"
                  id={r.name}
                >
                  <div
                    className="flex gap-2 items-center border-b pb-1 border-stone-200"
                    title="name"
                  >
                    <p className="text-lg" title={r.name}>
                      {r?.name}
                    </p>
                    <div className="text-xs rounded bg-stone-100 p-1 text-stone-700">
                      {
                        r?.relations.find((v) => v.name === targetEntity?.name)
                          ?.type
                      }
                    </div>
                  </div>
                  <div>{r.location}</div>
                  <div className="p-2">
                    <Markdown>
                      {Object.keys(r?.state || {})
                        .map((key) => `**${key}**: ${r?.state[key]}`)
                        .join("\n")}
                    </Markdown>
                  </div>
                </li>
              </>
            ))}
          </ul>
          <div
            className="no-select flex justify-between cursor-pointer p-2 px-4 active:scale-99 transtion duration-200 mt-3 bg-stone-100"
            onClick={() => {
              setOutIsOpen(!outIsOpen);
            }}
          >
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-2">north_west</span>
              Outbound Relations
            </div>
            <span
              className="material-symbols-outlined"
              style={{
                transform: outIsOpen ? "" : "rotateX(180deg)",
              }}
            >
              keyboard_arrow_down
            </span>
          </div>
          <ul
            className="px-3 overflow-hidden transition duration-200 border-b border-stone-200 bg-stone-100"
            style={{
              height: outIsOpen ? "" : "0",
            }}
          >
            {relatedEntitiesOut.map((r) => (
              <>
                <li
                  className="rounded-lg shadow-md p-2 mb-3 bg-white"
                  id={r.name}
                >
                  <div
                    className="flex gap-2 items-center border-b pb-1 border-stone-200"
                    title="name"
                  >
                    <div className="text-xs rounded bg-stone-100 p-1 text-stone-700">
                      {
                        targetEntity?.relations.find((v) => v.name === r?.name)
                          ?.type
                      }
                    </div>
                    {/* <span className="text-xs rounded bg-stone-100 p-1 text-stone-700">
                {r?.id}
              </span>}
                    <p title={r.name} className="text-lg">
                      {r?.name}
                    </p>
                  </div>
                  <div>{r.location}</div>
                  <div className="p-2">
                    <Markdown>
                      {Object.keys(r?.state || {})
                        .map((key) => `**${key}**: ${r?.state[key]}`)
                        .join("\n")}
                    </Markdown>
                  </div>
                </li>
              </>
            ))}
          </ul>
        </div> */}
      </div>
    </>
  );
}
