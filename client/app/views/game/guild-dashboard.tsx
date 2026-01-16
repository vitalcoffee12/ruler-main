import { useLocation, useNavigate } from "react-router";
import GuildChat from "~/components/guild/guild-chat";
import GuildHeader from "~/components/guild/guild-header";
import GuildMemberList from "~/components/guild/guild-member-list";
import GuildWorld from "~/components/guild/guild-world";

export default function Dashboard() {
  const nav = useNavigate();
  const location = useLocation();
  const guildId = location.pathname.split("/")[2];

  return (
    <div className="guild-dashboard">
      <div className="guild-dashboard-header">
        <GuildHeader
          guildId={guildId}
          guildName="미나어리마넝리ㅏㅁ너이ㅏ러민;ㅏ어리;만어리ㅏ먼이"
        />
      </div>
      <div className="guild-dashboard-leftside no-scrollbar">
        <div>
          <GuildMemberList members={members} guildId={guildId} />
        </div>
      </div>
      <div className="guild-dashboard-mainside no-scrollbar whitespace-pre-wrap">
        <div>
          <GuildChat guildId={guildId} messages={chats} />
        </div>
      </div>
      <div className="guild-dashboard-rightside no-scrollbar">
        <GuildWorld worlds={worlds} guildId={guildId} relations={relations} />
      </div>
    </div>
  );
}

const members = [
  { userId: "user-1", name: "Alice", icon: "https://picsum.photos/200" },
  { userId: "user-2", name: "Bob", icon: "https://picsum.photos/120" },
  { userId: "user-3", name: "Charlie", icon: "https://picsum.photos/180" },
];

const chats: {
  isGm: boolean;
  userId: string;
  icon: string;
  author: string;
  content: string;
  timestamp: string;
  quotes: { content: string; id: string }[];
  changes?: string;
}[] = [
  {
    isGm: false,
    userId: "user-1",
    icon: "https://picsum.photos/200",
    author: "Alice",
    content: "Hello, everyone!",
    timestamp: "2024-06-01 10:00 AM",
    quotes: [],
  },
  {
    isGm: false,
    userId: "user-2",
    icon: "https://picsum.photos/120",
    author: "Bob",
    content: "Hi Alice! How are you?",
    timestamp: "2024-06-01 10:05 AM",
    quotes: [],
  },
  {
    isGm: false,
    userId: "user-3",
    icon: "https://picsum.photos/180",
    author: "Charlie",
    content: "Good morning!",
    timestamp: "2024-06-01 10:10 AM",
    quotes: [],
  },
  {
    isGm: false,
    userId: "user-2",
    icon: "https://picsum.photos/120",
    author: "Bob",
    content:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    timestamp: "2024-06-01 10:05 AM",
    quotes: [],
  },
  {
    isGm: true,
    userId: "gm-145",
    icon: "https://picsum.photos/220",
    author: "Game Master",
    content: `## Cui nos oblectamina

Dicta plebe, est *dixi* ducentem relevasse prement quantus stramina. Pennis
verti. Limite sub vineta \`sample\` sis et nuruumque ire non et quae praesens
fregit recens; [facta](#est-unus-irascere). Niveisque et modo latens, et a
curvata, traditur ferri illa. Natum de unus aura postquam colentibus iuvenis
*simul* pastores apud soleo, fugis, suis qui!

Erubuit tellus quibus! Luna **sic serpentis lucis** meis rapuere: vita fames
fallere rexerit in Phryges caligine tempora Pelasga, si sidera, iam. Visa
superbus inde igne Phylius intendunt unica tam natae in feriam *in* traderet
sed, vulgus quibus vitamque. Tibi picto cernit hactenus concipit; tellus Ossaeae
deus tinguit vox quam est; adhuc? Cecidere secutus esse animans ardent tegmine
manebat Proserpina quam!

## Quoque quas quae crebri

Umente pinetis marmore positisque, vivitur fulget verebor fertilitas et
coeperunt linguae. Manus sic et per verbisque iuncta a circum misso vulnere.
Pueri rapidisque resque.

> Uterque et quarum pressit non propago nullos
> [restabat](#melaneus-murmura-regia), habebit his *ingemit sparsaque* at ore.
> Quicquid crimen offensa quidem, repugnat velare et causa avis viros, o, *tali
> aliquid et* flectit natat. Nec di dira sperat favete praeter cum sortis inter
> crescere, labant malis genitor, opto videt diroque suspenderat? Vertitur
> oscula in nisi, suo alii tuli perveniunt illo mactatos acceptaque illo: nisi
> quis duxere bonis.`,
    timestamp: "2024-06-01 10:10 AM",
    quotes: [
      {
        content: `Nisi sacra qui iactum puppe neque sparsa tactusque memores \`fileJfs\` huc
**parantur Iamque qui** fata timens.`,
        id: "msg-002",
      },
    ],
    changes: "sd",
  },
];

const worlds: { nodeId: string; name: string; description: string }[] = [
  {
    nodeId: "node-1",
    name: "Starting Village",
    description: "The peaceful village where adventures begin.",
  },
  {
    nodeId: "node-2",
    name: "Enchanted Forest",
    description: "A mystical forest filled with magical creatures.",
  },
  {
    nodeId: "node-3",
    name: "Dragon's Lair",
    description: "The dangerous lair of the fearsome dragon.",
  },
  {
    nodeId: "node-4",
    name: "Crystal Caves",
    description: "Caves glittering with precious crystals and hidden secrets.",
  },
  {
    nodeId: "node-5",
    name: "Ancient Ruins",
    description:
      "Ruins of a long-lost civilization, filled with traps and treasures.",
  },
  {
    nodeId: "node-6",
    name: "Sky Fortress",
    description: "A floating fortress high above the clouds.",
  },
  {
    nodeId: "node-7",
    name: "Underwater City",
    description: "A city beneath the waves, home to merfolk and sea creatures.",
  },
  {
    nodeId: "node-8",
    name: "Volcanic Wasteland",
    description: "A harsh landscape of lava and ash, ruled by fire elementals.",
  },
  {
    nodeId: "node-9",
    name: "Haunted Marsh",
    description:
      "A spooky marshland filled with ghosts and other supernatural beings.",
  },
  {
    nodeId: "node-10",
    name: "Frozen Tundra",
    description:
      "A cold and desolate region, home to ice giants and frost wolves.",
  },
  {
    nodeId: "node-11",
    name: "Sunken Temple",
    description:
      "An ancient temple submerged underwater, filled with aquatic dangers.",
  },
  {
    nodeId: "node-12",
    name: "Mystic Mountains",
    description:
      "Towering mountains shrouded in mystery and home to wise sages.",
  },
  {
    nodeId: "node-13",
    name: "Kcristina",
    description:
      "A Pretty women who lives in the mystic mountains and gives wisdom to travelers.",
  },
  {
    nodeId: "node-14",
    name: "Celestia",
    description:
      "A clever cat who lives in the sky fortress and guards ancient secrets.",
  },
  {
    nodeId: "node-15",
    name: "Aeliana",
    description:
      "A brave warrior from the underwater city who seeks adventure.",
  },
];

const relations: { fromNodeId: string; toNodeId: string; type: string }[] = [
  {
    fromNodeId: "node-1",
    toNodeId: "node-2",
    type: "path",
  },
  {
    fromNodeId: "node-2",
    toNodeId: "node-3",
    type: "path",
  },
  {
    fromNodeId: "node-3",
    toNodeId: "node-4",
    type: "path",
  },
  {
    fromNodeId: "node-4",
    toNodeId: "node-5",
    type: "path",
  },
  {
    fromNodeId: "node-5",
    toNodeId: "node-6",
    type: "path",
  },
  {
    fromNodeId: "node-13",
    toNodeId: "node-12",
    type: "lived_in",
  },
  {
    fromNodeId: "node-6",
    toNodeId: "node-7",
    type: "path",
  },
  {
    fromNodeId: "node-7",
    toNodeId: "node-8",
    type: "path",
  },
  {
    fromNodeId: "node-13",
    toNodeId: "node-14",
    type: "friend",
  },
  {
    fromNodeId: "node-14",
    toNodeId: "node-13",
    type: "friend",
  },
];
