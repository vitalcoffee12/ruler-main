export const MODELS = {
  llama3: "llama3.3:latest",
  qwen_embedding: "qwen3-embedding:latest",
};

export const COLLECTION_SUFFIX = {
  GAME_HISTORY: "g",
  SCENE_HISTORY: "s",
  RULE_SET: "r",
  TERM_SET: "t",
};

export const DEFAULT_PAGINATION = {
  LIMIT: 20,
  OFFSET: 0,
};

export const BASE_PROMPT = `{role} {task}
{ref}

# Instructions:
{instructions}

# Output Format:
Return the result in the following JSON format:
{outputFormat}

# Examples:
{examples}

# Input:
{input}
`;

export const MODEL_ROLE = {
  RULE_EDITOR: "You are a rule editor for text-based role-playing games.",

  GAME_DESIGNER:
    "You are an imaginative and skilled game designer specializing in text-based adventure games.",
  STORYTELLER:
    "You are a creative and engaging storyteller for a text-based adventure game.",
  EDITOR:
    "You are a meticulous game designer specializing in refining and enhancing text-based adventure game worlds.",
};

export const MODEL_TASK = {
  RULE_EDITOR:
    "Given document, you need to refine and structure the rules for a text-based role-playing game. The games run based on user input and AI generation, and rule may work as reference for both users and AI agents during the game play. Ensure that the rules can be searched by contextual embedding and retrieved effectively when needed during the game play.",
  GAME_MASTER:
    "Create and narrate an immersive text-based adventure game experience for the players. Guide players through the story, present challenges, and respond to their actions in a dynamic and engaging manner. Given the context, craft compelling scenarios that captivate the players' imagination. Ensure that the narrative is coherent, interactive, and tailored to the players' choices. If necessary, give rule description from base knowledge to guide players",
  CREATE_WORLD:
    "Create a rich and immersive text-based adventure game world with detailed descriptions, story hooks, and settings.",
  CONTINUE_STORY:
    "Continue the text-based adventure game story, building upon the existing narrative while introducing new elements and maintaining coherence.",
  EDIT_WORLD:
    "Edit and enhance the existing text-based adventure game world and state to improve engagement and coherence. Based on the current world and story and Game Master's history, identify entities that changed by previous history, update their descriptions, attributes, and relationships accordingly. or introduce new entities to enrich the game world while ensuring consistency with established lore and rules.",
};

export const MODEL_INSTRUCTION = {
  RULE_EDITOR: `- Analyze the provided document to identify keywords relevant to the game.
- For each identified keyword, create a rule entry that includes:
  - A detailed description that explains the rule's purpose and application within the game.
  - Examples or scenarios illustrating how the rule can be applied during gameplay.
- Give clear summaries for each rule, ensuring they are easy to understand. Also optimize them for effective retrieval using contextual embedding techniques during gameplay.`,

  CREATE_WORLD: `- Develop a captivating setting with unique locations, characters, and lore.
- Introduce intriguing story hooks to engage players from the start.
- Ensure the world is coherent and offers opportunities for exploration and interaction.`,
  CONTINUE_STORY: `- Build upon the existing narrative while maintaining consistency with established plot points and character development.
- Introduce new challenges, characters, and plot twists to keep the story engaging.
- Ensure smooth transitions between story segments.`,
  EDIT_WORLD: `- Review the existing game world and story content.
- Suggest and implement enhancements to locations, characters, and story hooks.
- Ensure the world offers a rich and immersive experience for players.`,
};

export const MODEL_OUTPUT_FORMAT = {
  RULE_EDITOR: `{
  "keywords": [
    {
      "term": "string", // The identified keyword or term
      "description": "string" // A detailed description based on rule
    }
  ],
  "summary": "string" // A summary of the rules * required
}`,
};

export const FORMAT = {
  RULE_EDITOR: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        items: {
          type: "object",
          properties: {
            term: {
              type: "string",
            },
            description: {
              type: "string",
            },
          },
        },
      },
      summary: {
        type: "string",
      },
    },
  },
};

function formatPrompt(replace: {
  role: string;
  task: string;
  instructions: string;
  outputFormat: string;
  ref: string;
  examples: string;
  input: string;
}) {
  let prompt = BASE_PROMPT;
  for (const key in replace) {
    const value = replace[key as keyof typeof replace];
    const regex = new RegExp(`{${key}}`, "g");
    prompt = prompt.replace(regex, value);
  }
  return prompt;
}

export const PROMPT = {
  RULE_EDITOR: (documents: string) =>
    formatPrompt({
      role: MODEL_ROLE.RULE_EDITOR,
      task: MODEL_TASK.RULE_EDITOR,
      ref: "",
      instructions: MODEL_INSTRUCTION.RULE_EDITOR,
      outputFormat: MODEL_OUTPUT_FORMAT.RULE_EDITOR,
      examples: "",
      input: documents,
    }),
};
