const fs = require("fs");

function splitRules(title, markdown, level) {
  const result = {
    title: title,
    content: [],
    level,
    children: [],
  };

  if (level > 6) {
    result.content = markdown;
    return result;
  }

  const regex = new RegExp(`^#{${level + 1}} `, "gm");
  const items = markdown.split(regex);

  const children = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].trim() === "") {
      continue;
    }
    if (i === 0 && !items[i].includes("# ")) {
      const contents = items[i].trim().split("\n");
      let paragraphs = "";
      for (const line of contents) {
        paragraphs += line.trim() + "\n";
        if (paragraphs.trim().length > 200) {
          result.content.push(paragraphs.trim());
          paragraphs = "";
        }
      }
      result.content.push(paragraphs.trim());
      continue;
    }

    const subtitle = items[i].split("\n")[0].trim();
    const content = items[i].substring(subtitle.length).trim();

    const child = splitRules(subtitle, content, level + 1);
    // process each item
    children.push(child);
  }
  result.children = children;
  return result;
}

function NestedRuleToRule(startId, categories, nestedRule) {
  const rules = [];
  const subCategories = [...categories, nestedRule.title];
  const rule = {
    id: startId,
    version: 1,
    title: nestedRule.title,
    content: nestedRule.content,
    keywords: [],
    categories: subCategories,
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const childrenRules = [];
  let currentId = startId + 1;
  for (let i = 0; i < nestedRule.children.length; i++) {
    rule.children.push(currentId);
    const child = nestedRule.children[i];
    const childRules = NestedRuleToRule(currentId, subCategories, child);
    childrenRules.push(...childRules.rules);
    currentId = childRules.endId;
  }

  rules.push(rule);
  rules.push(...childrenRules);

  return { rules, endId: currentId };
}

function buildRuleFromMarkdown(filename = "Blades-in-the-Dark-SRD.md") {
  const path = `./server/uploads/${filename}`;

  const rules = [];
  fs.readFile(path, "utf8", async (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    const nestedRule = splitRules("Blades in the Dark", data, 0);
    rules.push([...NestedRuleToRule(1, [], nestedRule).rules]);

    fs.writeFile(
      "./server/uploads/rules.json",
      JSON.stringify(rules, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log("Rules have been saved to rules.json");
        }
      },
    );
  });
  return rules;
}

// fs.readFile("./server/uploads/Blades-in-the-Dark-SRD.md", "utf8", (err, data) => {
//   if (err) {
//     console.error("Error reading file:", err);
//     return;
//   }

//   fs.writeFileSync(
//     "./server/uploads/result.json",
//     JSON.stringify(splitRules("blades in the dark", data, 0), null, 2),
//   );
//   //
// });

buildRuleFromMarkdown();
