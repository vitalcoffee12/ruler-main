import { sum } from "drizzle-orm";

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

  ENTITY_EDITOR: (
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

  NARRATOR_SYSTEM:
    () => `Based on the current game world state and chat history, generate a narrative for a text-based adventure game world.

User Input may contain:
- Previous Narrative: The last narrative generated for the game world, which can be used for continuity and reference.
- Chat History: A chronological list of player actions, messages, and system messages that have occurred in the game world.
- Documents: A collection of documents that provide rules about the game world. These documents can be referred to for accurate narrative generation.
- Terms: A list of important keywords and their descriptions that are relevant to the current game world.
- Entities: A list of existing entities in the game world, including their names and descriptions.

Player chat message look like:
[Player Id] player message 
- Player Id is a unique identifier for each player.

System message look like:
[System] system message

Document look like:
[Document Id] document content
- Document Id is a unique identifier for each document. Do not modify.

Term look like:
[Term Id] term: term description
- Term Id is a unique identifier for each term. Do not modify.

Entity look like:
[Entity Id] entity name: entity description (entity info, not visible to players, secrests, behind-the-scenes mechanics, or design intentions can be included here)
- Entity Id is a unique identifier for each entity. Do not modify.

Guidelines:
- Describe changes or reactions in the world based on player actions and system messages.
- Generate a engaging and immersive narrative that sets the tone for the game world.
- Drive the story forward while maintaining consistency with the provided documents, terms, and existing entities.
- Provide new challenges, discoveries, or developments in the world that encourage player interaction and exploration.
- Use rich, descriptive language to evoke emotions and stimulate the imagination of players.

- Also give a summary of the history of the current adventure, and the current state of the world, or changes. This will be contained in the next messages for coherent narrative generation.

Output format (JSON):
{
    "content": "string", // The narrative of current scene with Markdown format.
    "documents" : [ // Optional field for citing documents that influenced the narrative
        {
            "id": "string", // Document Id  
            "comment": "string" // A brief explanation of how this document influenced the narrative
        }
    ],
    "terms": [ // Optional field for citing terms that influenced the narrative
        {
            "id": "string", // Term Id
            "comment": "string" // A brief explanation of how this term influenced the narrative
        }
    ],
    "summary": "string" // A summary of the current adventure history and world state for coherent narrative generation
}
  `,
  NARRATOR: (
    prev: string,
    chatHistory: string,
    documents: string,
    terms: string,
    entities: string,
  ) =>
    `
Previous Narrative:
${prev}

Chat History:
${chatHistory}

Documents:
${documents}

Terms:
${terms}

Entities:
${entities}

  `,

  EDITOR_SYSTEM:
    () => `Based on the current game world state and narrative description, generate changes for the game world.

User Input may contain:
- Narrative: The last narrative generated for the game world, which can be used for continuity and reference.
- Scene Description: A brief description of the current scene, which can provide context for the changes.
- Documents: A collection of documents that provide rules about the game world. These documents can be referred to for accurate narrative generation.
- Terms: A list of important keywords and their descriptions that are relevant to the current game world.
- Entities: A list of existing entities in the game world, including their names and descriptions.


System message look like:
[System] system message

Document look like:
[Document Id] document content
- Document Id is a unique identifier for each document. Do not modify.

Term look like:
[Term Id] term: term description
- Term Id is a unique identifier for each term. Do not modify.

Entity look like:
[Entity Id] entity name: entity description (entity info, not visible to players, secrests, behind-the-scenes mechanics, or design intentions can be included here)
- Entity Id is a unique identifier for each entity. Do not modify.

Guidelines:
- If the narrative describes any changes to the world state, reflect those changes in the output entities. For example, if the narrative describes a player discovering a hidden door, you might add a new entity for the hidden door or update an existing entity to reflect that it has been discovered.
- Describe changes or reactions in the world based on player actions and system messages.
- Generate a list of entities that should be created, updated, or deleted based on the narrative and chat history.
- Use the provided documents, terms, and existing entities as references to ensure consistency in the game world.

Output format (JSON):
{
    "created": [
    {
        "id": "string",
        "name": "string",
        "description": "string",
        "info": "string" // Optional field for GM's reference, not used in gameplay
        "terms": ["number"] // Optional field for referencing term ids that inspired this entity
        "documents": ["number"] // Optional field for referencing document ids that influenced this entity
    }
    ],
    "updated": [
    {
        "id": "string",
        "name": "string",
        "description": "string",
        "info": "string" // Optional field for GM's reference, not used in gameplay 
        "terms": ["number"] // Optional field for referencing term ids that inspired this entity
        "documents": ["number"] // Optional field for referencing document ids that influenced this entity
    },
    "deleted": [
    {
        "id": "string"
    }
    ]
}
  `,

  EDITOR: (
    narrative: string,
    sceneDescription: string,
    documents: string,
    terms: string,
    entities: string,
  ) => `
Narrative:
${narrative}

Scene Description:
${sceneDescription}
    
Documents:
${documents}

Terms:
${terms}

Entities:
${entities}

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
  NARRATOR: {
    type: "object",
    properties: {
      content: { type: "string" },
      documents: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            comment: { type: "string" },
          },
        },
      },
      terms: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            comment: { type: "string" },
          },
        },
      },
      summary: { type: "string" },
    },
  },
  EDITOR: {
    type: "object",
    properties: {
      created: {
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
            documents: {
              type: "array",
              items: {
                type: "number",
              },
            },
          },
        },
      },
      updated: {
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
            documents: {
              type: "array",
              items: {
                type: "number",
              },
            },
          },
        },
      },
      deleted: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  },
};
