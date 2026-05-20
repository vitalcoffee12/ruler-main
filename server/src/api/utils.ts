import { Entity, ExtendEntity } from "./game/gameModel";

export function generateRandomCode(length: number = 8): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
export function getTimeStamp(length: number = 4): string {
  return new Date()
    .getTime()
    .toString()
    .slice(length * -1);
}

const PREDEFINED_COLOR_CODES = [
  // light pastel colors
  "#FFB3BA",
  "#FFBABE",
  "#FFBACD",
  "#FFC2BA",
  "#FFDFBA",
  "#FFFFBA",
  "#BAFFC9",
  "#BAFFB8",
  "#BAFFD6",
  "#BAFFD9",
  "#BAFFEC",
  "#BAE7FF",
  "#BAE1FF",
  "#E6BAFF",
  "#E2BAFF",
  "#D9BAFF",
  "#CBAFFF",
  "#FFBAF2",
  "#FFDAFA",
  "#FFBAE1",
  "#FFBACF",
  "#FFBACE",
  "#FFBACA",
  "#FFBCBA",
  "#FFD8BA",

  // dark pastel colors
  "#D67E7E",
  "#D67A9D",
  "#D67AB3",
  "#D68A7E",
  "#D6A77E",
  "#D6D67E",
  "#7ED69C",
  "#7ED6A5",
  "#7ED6B8",
  "#7ED6C2",
  "#7ED6CE",
  "#7EB8D6",
  "#7EAED6",
  "#9D7ED6",
  "#B37ED6",
  "#C67ED6",
  "#AF7ED6",
  "#D67ECF",

  // soft colors
  "#FFA07A",
  "#20B2AA",
  "#87CEFA",
  "#9370DB",
  "#FF69B4",
  "#FFD700",
  "#40E0D0",
  "#FF6347",
  "#4682B4",
  "#DDA0DD",
  "#F08080",
  "#3CB371",
  "#6495ED",
  "#BA55D3",
];

export function GenerateRandomColorCode(): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return PREDEFINED_COLOR_CODES[
    Math.floor(Math.random() * PREDEFINED_COLOR_CODES.length)
  ];
  return color;
}

export function GenerateGuildCode(): string {
  const prefix = "G";
  return prefix + getTimeStamp(10) + generateRandomCode(2);
}
export function GenerateDocumentCode(): string {
  const prefix = "D";
  return prefix + getTimeStamp(10) + generateRandomCode(2);
}
export function GenerateTermSetCode(): string {
  const prefix = "T";
  return prefix + getTimeStamp(10) + generateRandomCode(2);
}

export function GenerateCommunityCode(): string {
  const prefix = "C";
  return prefix + getTimeStamp(2) + generateRandomCode(6);
}
export function GenerateUserCode(): string {
  const prefix = "U";
  return prefix + getTimeStamp(2) + generateRandomCode(6);
}
export function GenerateEntityCode(): string {
  return "E" + getTimeStamp(1) + generateRandomCode(8);
}

export function getCodeWithoutPrefix(code: string): string {
  return code.split("-")[1] || code;
}

export function removeMarkdownFormatting(origin: string): string {
  let text = origin;
  text = text.replace(/#{1,6}/g, ""); // headings
  text = text.replace(/(```)/g, ""); // code blocks and inline code
  text = text.replace(/~~/g, ""); // strikethrough
  text = text.replace(/(\*\*|__)/g, ""); // bold
  return text;
}

export function CommonNeighbors(
  world: Entity[],
  current: Entity,
  target: Entity,
  depth: number = 2,
): Entity[] {
  if (depth <= 0) {
    return [];
  }
  const commons = current.relations.filter((r) =>
    target.relations?.some((tr) => tr.name === r.name),
  );
  const ce = world.filter((e) => commons.some((c) => c.name === e.name));

  const children = [];
  for (const c of ce) {
    const neighbors = CommonNeighbors(world, c, target, depth - 1);
    children.push(...neighbors);
  }
  ce.push(...children.filter((c) => !ce.some((e) => e.name === c.name)));

  return ce;
}

export function ExtendToEntity(extend: ExtendEntity[]): Entity[] {
  return extend.map((e) => ({
    name: e.name,
    type: e.type,
    location: e.location,
    relations: e.relations,
    state: e.state,
  }));
}
