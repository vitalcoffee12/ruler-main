import type { Entity, Guild } from "../common.interface";

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
  const targetEntity = props.world.find((e) => e.id === props.id);
  const relatedEntitiesIn = props.world.filter((e) =>
    e.relations.some((r) => r.id === targetEntity?.id),
  );

  const relatedEntitiesOut = targetEntity?.relations
    .map((r) => props.world.find((w) => w.id === r.id))
    .filter((f) => f);

  return (
    <>
      <div>
        {targetEntity?.id}
        {targetEntity?.name}
        {targetEntity?.description}
      </div>
      <div>
        {relatedEntitiesIn.map((r) => (
          <>
            {targetEntity?.relations.find((v) => v.id === r.id)?.type}
            {r.id}
            {r.name}
            {r.description}
          </>
        ))}
      </div>
    </>
  );
}
