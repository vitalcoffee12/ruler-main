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

export const PREDEFINED_USER = {
  GUILD: (code: string, name: string) => ({
    id: 0,
    code: code,
    name: "assistant",
  }),
  SYSTEM: {
    id: -1,
    code: "SYSTEM",
    name: "system",
  },
};

export const ENTITY_STATE = {
  UNLISTED: "unlisted",
  ACTIVE: "active",
  REMOVED: "removed",
};

export const BASE_PROMPT = `{role} {task}
{ref}

# Rule:
{rules}

# Output Format:
Return the result in the following JSON format:
{outputFormat}

# Examples:
{examples}

# Input:
{input}
`;

export const PROMPTS = {
  RULE_EDITOR: (documents: string) =>
    `This document describes rules for a text-based role-playing system. 

Your tasks:

1. Identify keywords.
  - Keywords must represent important concepts, mechanics, or elements relevant to the game
  - Avoid generic language terms unless they have a specific rule meaning
  - Prefer multi-word phrases when they represent a distinct concept

2. For each keyword, provide a description that:
  - Is strictly grounded in the document
  - Explains the rule's purpose and application within the game

3. Produce a high-recall summary of the document that:
  - Preserves rule logic and constraints
  - Avoids flavor text unless mechanically relevant
  - Is written for retrieval

Output format:
{
  "keywords": [
    {
      "term": "string", // The identified keyword or term
      "description": "string" // A detailed description based on rule
    }
  ],
  "summary": "string" // A summary of the rules * required
}

Document:
${documents}
  `,
  ENTITY_ENDITOR: (
    topic: string,
    entities: string,
    refs: string,
  ) => `Edit the following entities based on the topic and reference entities.

Topic:
${topic}
  
Entities to edit:
${entities}

Reference entities:
${refs}

Guidelines:
- No new entities should be created, only edit the provided entities.
- Edit the entities to better fit the topic while maintaining their core identity.
- Use the reference entities to ensure consistency in style and content.
- Do not change the entity IDs.
- Focus on improving descriptions and names for better gameplay and retrieval.
  
Output format (STRICT JSON):
[
  {
    "id": "string", // Must match the input entity ID
    "name": "string", // Edited name, should be concise and unique
    "description": "string" // Edited description, should be useful for gameplay and retrieval
  }
]
`,
  GAME_DESIGNER: (
    terms: string,
    topic: string,
    maxCounts: number,
    refs: string,
    ids: string,
  ) =>
    `Generate entities for a text-based adventure game world.

Inputs:
- Core terms and definitions (optional):
${terms}

- Player instructions / theme (optional):
${topic}

- Existing entities for continuity (optional):
${refs}

- Ids for new entities (mandatory for new entities):
${ids}

Guidelines:

1. If player instructions are empty, generate entities by yourself.

2. If existing entities are provided:
   - New entities should be thematically consistent with existing ones
   - Avoid creating entities that are too similar to existing ones
   - The id is immutable and must not change

3. Generate no more than ${maxCounts} NEW entities.

4. New entities:
   - MUST use one id from the provided ${ids} list
   - Do NOT invent or modify ids
   - Each id may be used only once

Entity Guidelines:
- Each entity must represent a distinct gameplay-useful concept
- Avoid generic filler entities
- Names must be unique, concise, and setting-consistent
- Prefer concrete, interactable world elements
- Use the provided terms and references as inspiration but do not copy them directly

Description Field Guidelines:
- Focus on gameplay relevance and retrieval utility
- Important details include potential interactions, functions, and atmosphere
- Engage the imagination but avoid excessive lore or narrative padding
- Markdown formatting is allowed

Info Field Guidelines:
- The "info" field is for the GM's reference and should not contain information that players can access through gameplay.
- Focus on providing information that helps the GM understand the entity's role, potential interactions, and how it fits into the world.
- Secrets, behind-the-scenes mechanics, or design intentions can be included here.

Terms Field Guidelines:
- Ensure that the provided ids are used correctly and not reused across entities.
- If no terms are used, the "terms" field can be an empty array.


Output format (STRICT JSON):

[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "info": "string" // Optional field for GM's reference, not used in gameplay
    "terms": ["number"] // Optional field for referencing term ids that inspired this entity
  }
]

Before generating entities, internally verify that:
- No ids are reused
- No names collide with existing entities
Do not output this verification step.
  `,

  NARRATOR: (entities: string) =>
    `Generate a narrative description for a text-based adventure game world.
Guidelines:
- The narrative should be engaging and immersive, setting the tone for the game world.
- Focus on describing the environment, atmosphere, and any relevant background information that would help players understand the setting.
- Avoid introducing specific entities or mechanics in the narrative; instead, create a vivid picture of the world that encourages exploration.
- Use rich, descriptive language to evoke emotions and stimulate the imagination of players.
- The narrative should be concise enough to maintain player interest but detailed enough to provide a clear sense of place.
Output format (STRING):

A single string containing the narrative description of the game world.
  `,
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
  CREATE_WORLD: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        info: { type: "string" },
        terms: {
          type: "array",
          items: {
            type: "number",
          },
        },
      },
    },
  },
  NARRATIVE: {
    type: "object",
    properties: {
      content: { type: "string" },
      citations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            comment: { type: "string" },
          },
        },
      },
      entities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            comment: { type: "string" },
          },
        },
      },
    },
  },
};
