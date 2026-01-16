import { Outlet, useNavigate } from "react-router";
import LobbyMenu from "~/components/lobby/lobby-menu";

export default function Index() {
  const nav = useNavigate();
  return (
    <div className="lobby-index">
      <div className="row-start-1 row-end-2 col-span-5 flex items-center p-3 border-b border-stone-300 justify-between">
        <div className="flex items-center gap-2 py-2 rounded-lg italic text-stone-600">
          <span className="material-symbols-outlined"></span>
          <span>
            Build your world, <strong>Ruler</strong>
          </span>
        </div>

        <div
          className="flex items-center gap-2 bg-lime-100 px-3 py-2 rounded-lg text-lime-700 cursor-pointer hover:bg-lime-200 active:scale-95"
          onClick={() => {
            nav("/");
          }}
        >
          <span className="material-symbols-outlined">captive_portal</span>
          <span>Go to the Site</span>
        </div>
      </div>
      <div className="row-start-2 row-end-6 col-start-1 col-end-2 no-scrollbar">
        <LobbyMenu />
      </div>
      <div className="row-start-2 row-end-6 col-start-2 col-end-6">
        <Outlet />
      </div>
    </div>
  );
}
