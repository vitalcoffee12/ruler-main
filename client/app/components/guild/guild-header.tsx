import { useNavigate } from "react-router";

export default function GuildHeader(props: {
  guildId: string;
  guildName: string;
}) {
  const nav = useNavigate();
  return (
    <div
      className="cursor-pointer"
      onClick={() => {
        nav(`/game/${props.guildId}`);
      }}
    >
      {props.guildName}
    </div>
  );
}
