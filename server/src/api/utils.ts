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

export function GenerateGuildCode(): string {
  const prefix = "G-";
  const randomCode = generateRandomCode(8);
  return prefix + randomCode;
}
export function GenerateRuleSetCode(): string {
  const prefix = "R-";
  const randomCode = generateRandomCode(8);
  return prefix + randomCode;
}
export function GenerateCommunityCode(): string {
  const prefix = "C-";
  const randomCode = generateRandomCode(8);
  return prefix + randomCode;
}
export function GenerateUserCode(): string {
  const prefix = "U-";
  const randomCode = generateRandomCode(8);
  return prefix + randomCode;
}

export function removeMarkdownFormatting(origin: string): string {
  let text = origin;
  text = text.replace(/#{1,6}/g, ""); // headings
  text = text.replace(/(```)/g, ""); // code blocks and inline code
  text = text.replace(/~~/g, ""); // strikethrough
  text = text.replace(/(\*\*|__)/g, ""); // bold
  return text;
}
