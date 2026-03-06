import { Outlet, useNavigate } from "react-router";
import "./lobby.css";
import GuildList from "~/components/lobby/guild-list";
import { useModal } from "~/hooks/use-modal.hook";
import CreateGuildModal from "~/components/lobby/create-guild.modal";
import { useContext, useEffect, useState } from "react";
import useSocket from "~/hooks/use-socket.hook";
import { postRequest } from "~/request";
import { AuthContext } from "~/contexts/authContext";

export default function Layout() {
  const nav = useNavigate();
  const { auth, checkingAuth, setAuth } = useContext(AuthContext);
  const { Modal, openModal, closeModal } = useModal();
  const { isConnected, sendMessage } = useSocket();

  const [refreshGuildList, setRefreshGuildList] = useState(false);
  const [showProfileOver, setShowProfileOver] = useState<boolean>(false);

  useEffect(() => {
    if (isConnected) {
      sendMessage("USER_ONLINE");
    }
  }, [isConnected]);

  useEffect(() => {
    if (!auth.id && !checkingAuth) {
      nav("/auth/signin");
    }
    const handleClick = (e: MouseEvent) => {
      if (showProfileOver) {
        setShowProfileOver(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [checkingAuth]);

  const handleLogout = async () => {
    try {
      // Perform any necessary cleanup, such as clearing tokens or session data
      await postRequest(
        "/user/signout",
        {},
        {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      ); // Optional: Notify the server about the logout action
      // Redirect to the login page or home page
      window.localStorage.removeItem("auth");
      setAuth(null);
      nav("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
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
                <div className="absolute block bg-[#a4b9bd] w-2 h-2 rounded-full top-2 right-2" />
              </span>
            </div>
          </div>
          <div className="cursor-pointer hover:bg-stone-100 rounded-lg m-4 row-start-4 row-end-5 no-select active:scale-95 transition duration-150">
            <div onClick={() => setShowProfileOver(!showProfileOver)}>
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
