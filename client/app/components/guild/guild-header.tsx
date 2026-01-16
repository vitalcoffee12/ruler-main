import { useNavigate } from "react-router";

export default function GuildHeader(props: {
  guildId: string;
  guildName: string;
}) {
  const nav = useNavigate();
  return (
    <div className="flex justify-between w-full  h-full items-center p-4 ">
      <div
        className="cursor-pointer"
        onClick={() => {
          nav(`/game/${props.guildId}`);
        }}
      >
        {props.guildName}
      </div>
      <div className="material-symbols-outlined cursor-pointer hover:bg-stone-100 rounded-lg p-2 text-stone-600">
        book_4
      </div>
    </div>
  );
}
