import { Outlet } from "react-router";
import "./lobby.css";
import GuildList from "~/components/lobby/guild-list";

export default function Layout() {
  return (
    <>
      <div className="lobby-layout flex">
        <div className="lobby-leftside flex flex-col justify-between">
          <GuildList userId="user-123" />
          <div className="cursor-pointer hover:bg-stone-100 rounded-lg m-4">
            <div>
              <img
                src="https://picsum.photos/200"
                alt="profile picture"
                className="overflow-hidden w-12 h-12 rounded-xl"
              />
            </div>
          </div>
        </div>
        <div className="lobby-rightside">
          <Outlet />
        </div>
      </div>
    </>
  );
}
