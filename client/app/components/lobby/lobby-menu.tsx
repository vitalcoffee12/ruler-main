import { useNavigate } from "react-router";

export default function LobbyMenu(props: {}) {
  return (
    <>
      <div className="p-2 border-r border-stone-300 overflow-auto min-h-full h-full text-stone-800 text-sm">
        <ul>
          {menuItems.map((item) => (
            <li key={item.label}>
              <MenuItem
                label={item.label}
                icon={item.icon}
                route={item.route}
              />
            </li>
          ))}
        </ul>
        <hr className="my-4 border-stone-200" />
        <div className="mb-2 text-stone-600 text-sm px-2">Communities</div>
        <ul>
          {communities.map((community) => (
            <li key={community.label}>
              <CommunityItems
                label={community.label}
                icon={community.icon}
                route={community.route}
                alert={community.alert}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

const menuItems = [
  { label: "Explore", icon: "explore", route: "explore" },
  { label: "Friends", icon: "people", route: "friends" },
  { label: "Resources", icon: "book_4", route: "resources" },
  { label: "Shop", icon: "shopping_cart", route: "shop" },
];

function MenuItem(props: { label: string; icon: string; route: string }) {
  const nav = useNavigate();
  return (
    <div
      className="flex items-center mb-2 cursor-pointer hover:bg-stone-100 rounded-lg p-2"
      onClick={() => {
        nav(`/game/${props.route}`);
      }}
    >
      <span className="material-symbols-outlined mr-2 text-stone-600">
        {props.icon}
      </span>
      <span>{props.label}</span>
    </div>
  );
}

const communities = [
  {
    label: "General Discussion",
    icon: "https://picsum.photos/240",
    route: "communitiids",
    alert: 2,
  },
  {
    label: "Announcements",
    icon: "https://picsum.photos/210",
    route: "communities1111",
    alert: 99,
  },
  {
    label: "Support",
    icon: "https://picsum.photos/230",
    route: "communitiesupportasdf",
  },
];

function CommunityItems(props: {
  label: string;
  icon: string;
  route: string;
  alert?: number;
}) {
  const nav = useNavigate();
  return (
    <div
      className="flex items-center mb-2 cursor-pointer hover:bg-stone-100 rounded-lg p-2 relative"
      onClick={() => {
        nav(`/game/community/${props.route}`);
      }}
    >
      <img
        src={props.icon}
        alt={props.label}
        className="w-6 h-6 mr-2 rounded-full"
      />
      <span>{props.label}</span>
      {props.alert !== undefined && (
        <span className="flex items-center top-1/2 absolute text-[9px] right-2 px-2 py-1 rounded-full bg-lime-500 text-white font-bold transform -translate-y-1/2">
          {props.alert}
        </span>
      )}
    </div>
  );
}
