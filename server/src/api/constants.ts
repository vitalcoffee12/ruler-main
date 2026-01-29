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
  GAME_MASTER:
    "You are a creative and engaging storyteller for a text-based adventure game.",
  GAME_DESIGNER:
    "You are an imaginative and skilled game designer specializing in text-based adventure games.",
  STORYTELLER:
    "You are a creative and engaging storyteller for a text-based adventure game.",
  EDITOR:
    "You are a meticulous game designer specializing in refining and enhancing text-based adventure game worlds.",
};

export const MODEL_TASK = {
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
