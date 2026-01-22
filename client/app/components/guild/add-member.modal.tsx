export default function AddMemberModal(props: { guildId: string }) {
  return (
    <div className="">
      <div className="flex flex-col min-w-lg">
        <h2 className="text-lg mb-4">Invite friends to {props.guildId}</h2>
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
          {friends.map((friend) => (
            <FriendItem
              key={friend.userId}
              userId={friend.userId}
              userName={friend.userName}
              displayName={friend.displayName}
              icon={friend.icon}
            />
          ))}
        </div>

        <h2 className="mb-2 mt-2">Send Invites link to your friends to join</h2>
        <div>
          <input
            type="text"
            readOnly
            value={`https://ruler.gg/invite/${props.guildId}`}
            className="text-sm border border-stone-300 rounded px-2 py-2 w-full"
          />
        </div>
      </div>
    </div>
  );
}

function FriendItem(props: {
  userId: string;
  userName: string;
  displayName: string;
  icon: string;
}) {
  return (
    <div className="flex items-center mb-2 hover:bg-stone-100 p-2 transition duration-200 ">
      <img
        src={props.icon}
        alt={props.userName}
        className="w-10 h-10 rounded-full mr-2"
      />
      <div>
        <span className="block font-semibold">{props.displayName}</span>
        <span className="text-sm text-stone-500">{props.userName}</span>
      </div>
      <div className="ml-auto bg-lime-600 text-white px-2 py-1 rounded hover:bg-lime-700 transition duration-200 active:scale-95 cursor-pointer text-sm">
        Invite
      </div>
    </div>
  );
}

const friends = [
  {
    userId: "user1",
    userName: "asldkfjlas",
    displayName: "Alice",
    icon: "https://picsum.photos/210",
  },
  {
    userId: "user2",
    userName: "bob123",
    displayName: "Bob",
    icon: "https://picsum.photos/211",
  },
  {
    userId: "user3",
    userName: "charlie456",
    displayName: "Charlie",
    icon: "https://picsum.photos/212",
  },
  {
    userId: "user4",
    userName: "diana789",
    displayName: "Diana",
    icon: "https://picsum.photos/213",
  },
  {
    userId: "user5",
    userName: "eve101",
    displayName: "Eve",
    icon: "https://picsum.photos/214",
  },
  {
    userId: "user6",
    userName: "frank202",
    displayName: "Frank",
    icon: "https://picsum.photos/215",
  },
  {
    userId: "user7",
    userName: "grace303",
    displayName: "Grace",
    icon: "https://picsum.photos/216",
  },
];
