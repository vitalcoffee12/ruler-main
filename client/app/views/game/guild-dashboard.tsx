import { useLocation, useNavigate } from "react-router";
import GuildHeader from "~/components/guild/guild-header";

export default function Dashboard() {
  const nav = useNavigate();
  const location = useLocation();
  const guildId = location.pathname.split("/")[2];

  return (
    <div className="flex ">
      <div className="border-r border-stone-300 p-4 w-8/10 h-screen overflow-y-auto">
        <div className="">
          <GuildHeader
            guildId={guildId}
            guildName="미나어리마넝리ㅏㅁ너이ㅏ러민;ㅏ어리;만어리ㅏ먼이"
          />
        </div>
        asdflkajsdlkfj
      </div>
      <div className="p-4 max-w-2/10 h-screen overflow-y-auto">
        asldkjhflaksdfjl
      </div>
    </div>
  );
}
