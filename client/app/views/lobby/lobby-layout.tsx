import { Outlet, useNavigate } from "react-router";
import "./lobby.css";
import GuildList from "~/components/lobby/guild-list";
import { useModal } from "~/hooks/use-modal.hook";
import CreateGuildModal from "~/components/lobby/create-guild.modal";

export default function Layout() {
  const nav = useNavigate();
  const { Modal, openModal, closeModal } = useModal();

  return (
    <>
      <div className="lobby-layout">
        <div className="lobby-leftside no-scrollbar">
          <div
            className="cursor-pointer rounded-lg row-start-1 row-end-2 p-2 flex justify-center items-center"
            onClick={() => {
              nav("/game");
            }}
          >
            <div className="text-3xl font-bold border-b border-stone-300 w-full h-full flex justify-center items-center hover:text-lime-600">
              R
            </div>
          </div>
          <GuildList userId="user-123" onClickCreateGuild={openModal} />
          <div className="cursor-pointer hover:bg-stone-100 rounded-lg m-4 row-start-3 row-end-4">
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
      <Modal>
        <CreateGuildModal />
      </Modal>
    </>
  );
}
