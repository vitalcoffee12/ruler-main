import "./lobby.css";
import { Outlet, useNavigate } from "react-router";
import GuildList from "~/components/lobby/guild-list";
import useSocket from "~/hooks/use-socket.hook";
import { useModal } from "~/hooks/use-modal.hook";
import CreateGuildModal from "~/components/lobby/create-guild.modal";
import { useContext, useEffect, useState } from "react";
import defaultIcon from "./default-profile.jpg";
import { AuthContext } from "~/contexts/authContext";
import useToast from "~/hooks/use-toast.hook";
import useRequest from "~/hooks/use-request.hook";

export default function Layout() {
  const nav = useNavigate();

  const { auth, logout } = useContext(AuthContext);
  const { Modal, openModal, closeModal } = useModal();
  const [Toast, addToast] = useToast();
  const { payloads, isConnected, sendMessage } = useSocket();

  const [refreshGuildList, setRefreshGuildList] = useState(false);
  const [showProfileOver, setShowProfileOver] = useState<boolean>(false);

  const reqLogout = useRequest("/user/logout", "post");

  useEffect(() => {
    if (isConnected) {
      sendMessage("USER_ONLINE");
    } else {
      console.log("USER_OFFLINE");
      addToast("error", "Loggic is now offline! Try again...");
    }
  }, [payloads, isConnected, auth.code]);

  useEffect(() => {
    if (reqLogout.res?.status == 200) {
      logout();
    }
  }, [reqLogout.res, reqLogout.errorCode]);

  const handleLogout = async () => {
    try {
      await reqLogout.sendRequest({
        authorized: true,
      });
    } catch (error) {}
  };

  const profileOverMenu = [
    { icon: "settings", label: "Settings" },
    { icon: "account_circle", label: "Profile" },
    {
      icon: "logout",
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <div className="lobby-layout relative">
        <div className="lobby-leftside no-scrollbar">
          <div
            className="cursor-pointer row-start-1 row-end-2 p-2 flex justify-center items-center border-b border-stone-300"
            onClick={() => {
              nav("/game");
            }}
          >
            <div className="text-4xl font-bold w-full h-full flex justify-center items-center hover:text-lime-600 active:text-lime-300 active:scale-95 transition duration-200">
              GG
            </div>
          </div>
          <GuildList onClickCreateGuild={openModal} />
          <div>
            <div className="flex justify-center items-center h-full border-t border-stone-200">
              <span
                className="relative material-symbols-outlined text-stone-600 cursor-pointer hover:bg-stone-100 rounded-lg p-2 row-start-3 row-end-4 flex justify-center items-center no-select active:scale-95 transition duration-150 mt-3"
                style={{
                  fontSize: "2rem",
                }}
              >
                notifications
                <div className="absolute block bg-[#a4b9bd] w-2 h-2 rounded-full top-2 right-2" />
              </span>
            </div>
          </div>
          <div className="cursor-pointer hover:bg-stone-100 rounded-lg m-4 row-start-4 row-end-5 no-select active:scale-95 transition duration-150">
            <div onClick={() => setShowProfileOver(!showProfileOver)}>
              <img
                src={auth.iconPath || defaultIcon}
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
      <div
        className="bg-white shadow-md absolute bottom-16 left-18 z-99 rounded-lg w-48 overflow-hidden transition duration-150 text-stone-900"
        style={{ display: showProfileOver ? "block" : "none" }}
      >
        <ul>
          {profileOverMenu.map((item) => (
            <li
              key={item.label}
              className="flex gap-2 items-center hover:bg-stone-100 p-2 cursor-pointer transition duration-150"
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "1.2rem",
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
      {Toast}
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
