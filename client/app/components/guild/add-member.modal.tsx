import { useContext, useEffect, useState } from "react";
import { AuthContext } from "~/contexts/authContext";
import useRequest from "~/hooks/use-request.hook";
import useToast from "~/hooks/use-toast.hook";
import defaultIcon from "../../views/lobby/default-profile.jpg";

export default function AddMemberModal(props: {
  guildCode: string;
  guildName: string;
}) {
  const { auth } = useContext(AuthContext);
  const [users, setUsers] = useState<
    {
      id: number;
      code: string;
      displayName: string;
      iconPath: string;
    }[]
  >([]);

  const reqFetchFriends = useRequest("/user", "get");
  const [toast, addToast] = useToast();

  const fetchFriends = async () => {
    try {
      const res = await reqFetchFriends.sendRequest({
        authorized: true,
        authorization: auth.accessToken,
      });

      setUsers(res?.data.responseObject);
    } catch (error) {
      addToast("error", "Failed to fetch friend list");
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <>
      <div className="">
        <div className="flex flex-col min-w-lg">
          <h2 className="text-lg mb-4">
            Invite friends to
            <span className="font-semibold ml-1"> {props.guildName}</span>
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for friend"
              className="
          text-sm border border-stone-300 rounded px-2 py-2 mb-4 w-full"
            />
            <span className="material-symbols-outlined absolute right-2 top-2 cursor-pointer">
              search
            </span>
          </div>
          <div className="w-full border rounded-lg border-stone-300 max-h-[300px] overflow-y-auto mb-4 no-scrollbar">
            {users.map((friend) => (
              <FriendItem
                guildCode={props.guildCode}
                key={friend.id}
                userId={friend.id}
                userName={friend.code}
                displayName={friend.displayName}
                icon={friend.iconPath}
              />
            ))}
          </div>

          <h2 className="mb-2 mt-2">
            Send Invites link to your friends to join
          </h2>
          <div>
            <input
              type="text"
              readOnly
              value={`https://ruler.gg/invite/${props.guildCode}`}
              className="text-sm border border-stone-300 rounded px-2 py-2 w-full"
            />
          </div>
        </div>
      </div>
      {toast}
    </>
  );
}

function FriendItem(props: {
  guildCode: string;
  userId: number;
  userName: string;
  displayName: string;
  icon: string;
}) {
  const { auth } = useContext(AuthContext);
  const reqInvite = useRequest("/guild/invite", "post");

  const handleInvite = async () => {
    await reqInvite.sendRequest({
      authorized: true,
      authorization: auth.accessToken,
      body: {
        guildCode: props.guildCode,
        userId: props.userId,
      },
    });
  };

  return (
    <div className="flex items-center mb-2 hover:bg-stone-100 p-2 transition duration-200 ">
      <img
        src={props.icon ?? defaultIcon}
        alt={props.userName}
        className="w-10 h-10 rounded-full mr-2"
      />
      <div>
        <span className="block font-semibold">{props.displayName}</span>
        <span className="text-sm text-stone-500">{props.userName}</span>
      </div>
      <div
        className="ml-auto bg-lime-600 text-white px-2 py-1 rounded hover:bg-lime-700 transition duration-200 active:scale-95 cursor-pointer text-sm"
        onClick={handleInvite}
      >
        Invite
      </div>
    </div>
  );
}
