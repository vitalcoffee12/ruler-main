import { Outlet, useNavigate } from "react-router";
import "./lobby.css";
import GuildList from "~/components/lobby/guild-list";
import { useModal } from "~/hooks/use-modal.hook";
import CreateGuildModal from "~/components/lobby/create-guild.modal";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "~/contexts/userContext";
import useSocket from "~/hooks/use-socket.hook";

export default function Layout() {
  const nav = useNavigate();
  const user = useContext(UserContext);

  const { Modal, openModal, closeModal } = useModal();
  const { isConnected, sendMessage } = useSocket();

  const [refreshGuildList, setRefreshGuildList] = useState(false);

  useEffect(() => {
    console.log(`isConnected Changed :  `, isConnected);
    if (isConnected) {
      sendMessage("USER_ONLINE");
    }
  }, [isConnected]);

  return (
    <>
      <div className="lobby-layout">
        <div className="lobby-leftside no-scrollbar">
          <div
            className="cursor-pointer row-start-1 row-end-2 p-2 flex justify-center items-center border-b border-stone-300"
            onClick={() => {
              nav("/game");
            }}
          >
            <div className="text-4xl font-bold w-full h-full flex justify-center items-center hover:text-lime-600 active:text-lime-300 active:scale-95 transition duration-200">
              R
            </div>
          </div>
          <GuildList
            onClickCreateGuild={openModal}
            refreshGuildList={refreshGuildList}
          />
          <div>
            <div className="flex justify-center items-center h-full border-t border-stone-200">
              <span
                className="relative material-symbols-outlined text-stone-600 cursor-pointer hover:bg-stone-100 rounded-lg p-2 row-start-3 row-end-4 flex justify-center items-center no-select active:scale-95 transition duration-150 mt-3"
                style={{
                  fontSize: "2rem",
                }}
              >
                notifications
                <div className="absolute block bg-lime-500 w-2 h-2 rounded-full top-2 right-2" />
              </span>
            </div>
          </div>
          <div className="cursor-pointer hover:bg-stone-100 rounded-lg m-4 row-start-4 row-end-5 no-select active:scale-95 transition duration-150">
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
        <CreateGuildModal
          onClose={() => {
            closeModal();
          }}
          onRefresh={() => {
            setRefreshGuildList(!refreshGuildList);
          }}
        />
      </Modal>
    </>
  );
}
