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
        <EntityRef world={props.world} id={props.data} />
      )}
    </>
  );
}

function EntityRef(props: { id: string; world: Entity[] }) {
  const [inIsOpen, setInIsOpen] = useState<boolean>(true);
  const [outIsOpen, setOutIsOpen] = useState<boolean>(true);
  const targetEntity = props.world.find((e) => e.id === props.id);
  const relatedEntitiesIn = props.world.filter((e) =>
    e.relations.some((r) => r.id === targetEntity?.id),
  );

  const relatedEntitiesOut = props.world.filter((e) =>
    targetEntity?.relations.some((r) => r.id === e.id),
  );

  return (
    <>
      <div className="grid grid-rows-[auto_1fr] pb-7 bg-stone-100">
        <div className="p-3 m-2 border-b border-stone-200">
          <div
            className="flex gap-2 items-center border-b pb-1 border-stone-200"
            title="id"
          >
            <span className="text-xs rounded bg-stone-100 p-1 text-stone-700">
              {targetEntity?.id}
            </span>
            <p title="name" className="text-lg">
              {targetEntity?.name}
            </p>
          </div>
          <div className="p-2">
            <Markdown>{targetEntity?.description}</Markdown>
          </div>
        </div>
        <div className=" ">
          <div
            className="no-select flex justify-between cursor-pointer p-2 px-4 active:scale-99 transtion duration-200"
            onClick={() => {
              setInIsOpen(!inIsOpen);
            }}
          >
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-2">input</span>
              Inbound Relations
            </div>
            <span
              className="material-symbols-outlined"
              style={{
                transform: inIsOpen ? "rotateX(180deg)" : "",
              }}
            >
              keyboard_arrow_down
            </span>
          </div>
          <ul
            className="px-3 border-l-3 ml-7 overflow-hidden transition duration-200"
            style={{
              height: inIsOpen ? "" : "0",
            }}
          >
            {relatedEntitiesIn.map((r) => (
              <>
                <li className="rounded-lg shadow-sm p-2 mt-2" id={r.id}>
                  <div
                    className="flex gap-2 items-center border-b pb-1 border-stone-200"
                    title="id"
                  >
                    <p className="text-lg" title={r.id}>
                      {r?.name}
                    </p>
                    <div className="text-xs rounded bg-stone-100 p-1 text-stone-700">
                      {
                        r?.relations.find((v) => v.id === targetEntity?.id)
                          ?.type
                      }
                    </div>
                  </div>
                  <div className="p-2">
                    <Markdown>{r?.description}</Markdown>
                  </div>
                </li>
              </>
            ))}
          </ul>
          <div
            className="no-select flex justify-between cursor-pointer p-2 px-4 active:scale-99 transtion duration-200 mt-3"
            onClick={() => {
              setOutIsOpen(!outIsOpen);
            }}
          >
            <div className="flex items-center">
              <span
                className="material-symbols-outlined mr-2"
                style={{ transform: "rotate(180deg)" }}
              >
                output
              </span>
              Outbound Relations
            </div>
            <span
              className="material-symbols-outlined"
              style={{
                transform: outIsOpen ? "rotateX(180deg)" : "",
              }}
            >
              keyboard_arrow_down
            </span>
          </div>
          <ul
            className="px-3 border-l-3 ml-7 overflow-hidden transition duration-200"
            style={{
              height: outIsOpen ? "" : "0",
            }}
          >
            {relatedEntitiesOut.map((r) => (
              <>
                <li className="rounded-lg shadow-sm p-2 mt-2" id={r.id}>
                  <div
                    className="flex gap-2 items-center border-b pb-1 border-stone-200"
                    title="id"
                  >
                    <div className="text-xs rounded bg-stone-100 p-1 text-stone-700">
                      {
                        targetEntity?.relations.find((v) => v.id === r?.id)
                          ?.type
                      }
                    </div>
                    {/* <span className="text-xs rounded bg-stone-100 p-1 text-stone-700">
                {r?.id}
              </span> */}
                    <p title={r.id} className="text-lg">
                      {r?.name}
                    </p>
                  </div>
                  <div className="p-2">
                    <Markdown>{r?.description}</Markdown>
                  </div>
                </li>
              </>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
