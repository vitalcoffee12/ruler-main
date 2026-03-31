import { sum } from "drizzle-orm";

export const PROMPTS = {
  DOC_PROCESSOR_SYSTEM: () => ``,
  DOC_PROCESSOR: (documents: string) =>
    `You have to generate document summary This document describes rules for a text-based role-playing system. 
Input document may contain:
- Core theme of the game world
- Concepts of the game world.
- etcs.

Guildlines:
  Produce a high-recall summary of the document that:
  - Preserves rule logic and constraints
  - Avoids flavor text unless mechanically relevant
  - Is written for retrieval

Output should be a summary of the document. 
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
  WORLD_GENERATOR_SYSTEM: () => `You are a game world designer.
Based on given document, generate rich game world entities.

Each entity consists of:
  - name : name of the entity
  - description : description of the entity. may contain appearance, features, traits, personality, lores or any other.
  - secrests : secrests of the entity. it will not be revealed to players. but make the entity richer and interesting
  - relations : a list of realtion the entity has. it contains target entity's id, and type of relation, describing their relation.
  
Guildlines:
   - New entities should be thematically consistent with existing ones
   - Avoid creating entities that are too similar to existing ones
   - All entities in relations need to be exist.

Output format (STRICT JSON):
[
  {
    "name": "string", // Edited name, should be concise and unique
    "description": "string", // Edited description, should be useful for gameplay and retrieval
    "secrets": "string", // interesting lore, background or anything
    "relations" : [
      {
          "name": "string", // target entities name
          "type": "string", // relation type
      }
    ]
  }
]
  `,
  WORLD_GENERATOR: (doc: string) => `
Document:
${doc}`,

  ENTITY_EDITOR: (
    request: string,
    entities: string,
    refs: string,
  ) => `Edit the following entities based on the topic and reference entities.

Player Request:
${request}
  
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
  GAME_DESIGNER_SYSTEM: () =>
    `Based on the current game world state and core terms, generate entities for a text-based adventure game world.
The game is a text-based adventure game where players interact with the world through text commands and receive narrative descriptions in response. 

Input may contain:
- Core theme
- Players' request
- Existing entities
- Ids for new entities

Core terms look like:
[term Id] term: definition of term
- Term Id is unique identifier of the term. do not modify.

Player's instruction or theme may contain:
- Additional guideline for creating entities
- Concepts they want.
- Or other requests.

Existing entities look like:
[Entity Id] name: description of entity (info of entitiy- hidden from players, only gm can visible)
- Entity Id is unique identifier of the entity. do not modify.

Ids for new entities is comma seperated.


Guidelines:
1. If player instructions are empty, generate entities by yourself.
2. If existing entities are provided:
   - New entities should be thematically consistent with existing ones
   - Avoid creating entities that are too similar to existing ones
3. Generate no more than count of Ids for new entities.
4. New entities:
   - MUST use one id from the provided new Ids list
   - Do NOT invent or modify ids
   - Each id may be used only once

Entity Guidelines:
- Each entity must represent a distinct gameplay-useful concept
- Avoid generic filler entities
- Names must be unique, concise, and setting-consistent
- Prefer concrete, interactable world elements
- Use the provided terms and references as inspiration but do not copy them directly
- Give them interesting relation each other or with existing entities

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
- You can use core terms for enhancing and rich entities.
- Check if the entity has core concept of the term. If so, include the term id in the list.

Relations Field Guidelines:
- If entities has relation. include each other's entity Id in the list and give relation type for it. 
ex) entity A and B are friend, type would be 'friend' ect...
- each entity can have multiple relations

Output format (STRICT JSON):

[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "secrets": "string" // Optional field for GM's reference, not used in gameplay
    "relations" : [{"id" : "string", "type": "string"}] // optional field for relation between entities
  }
]

Before generating entities, internally verify that:
- No ids are reused
- No names collide with existing entities
Do not output this verification step.
`,
  GAME_DESIGNER: (
    theme: string,
    request: string,
    entities: string,
    ids: string,
  ) =>
    `
Core theme (optional):
${theme}

Player's request (optional):
${request}

Existing entities for continuity (optional):
${entities}

Ids for new entities (mandatory for new entities):
${ids}
  `,

  NARRATOR_SYSTEM:
    () => `Based on the current game world state and chat history, generate a narrative for a text-based adventure game world.
The game is a text-based adventure game where players interact with the world through text commands and receive narrative descriptions in response. The narrative should be engaging, immersive, and consistent with the provided information.

Input may contain:
- Player List: The List of Player Ids separated by commas
- Previous Narrative: The last narrative generated for the game world by assistant which can be used for continuity and reference. 
- Chat History: A chronological list of player actions, messages, and system messages that have occurred in the game world.
- Quests: A collection of quests that provided. 
- Entities: A list of existing entities in the game world, including their names and descriptions.

Player chat message look like:
[Player Id] player message 
- Player Id is a unique identifier for each player.
- Player message can be an action, a dialogue, or any form of interaction with the game world.
- If Player Id is same with entity Id, it means the message is an in-character message from a player character, which can be used for narrative generation.

System message look like:
[System] system message

Quest look like:
\`[Quest Id] quest description From [quest Giver Id]
- (quest state) quest objective
- History : quest progress history
- Reward : quest reward list
\`
- Quest Id is a unique identifier for each quest. Do not modify.

Term look like:
[Term Id] term: term description
- Term Id is a unique identifier for each term. Do not modify.

Entity look like:
[Entity Id] entity name: entity description (entity info, not visible to players, secrests, behind-the-scenes mechanics, or design intentions can be included here)
- Entity Id is a unique identifier for each entity. Do not modify.
- If Entity Id is same with player Id, it means the entity is a player. 
- Generate in players character's view


Guidelines:
- Include
1. Provide interaction result that reflects the current state of the game world, player actions, and system messages.
2. Ensure the narrative is consistent with existing entities.
3. if needed, role as NPC characters to interact with players and drive the story forward.
4. Provide new quets, challenges, discoveries, or developments in the world that encourage player interaction and exploration.
5. Do not copy and paste content from messages, Istead, use them as references to create a unique narrative that fits the current game state.
6. Focus on creating an engaging and dynamic story that evolves based on player actions and system events.
7. When you talk about the player, use character name instead of player id for better immersion.
8. Answer to player's message if it contains a question or a direct request.

- Use Markdown formatting.
- Also give a summary of the history of the current adventure, current state of the world, or changes. This will be contained in the next messages for coherent narrative generation.

Output format (JSON):
{
    "content": "string", // The narrative of current scene with Markdown format.
    "summary": "string" // A summary of the current adventure history and world state for coherent narrative generation
}
  `,
  NARRATOR: (
    players: string,
    chatHistory: string,
    quests: string,
    // documents: string,
    // terms: string,
    entities: string,
  ) =>
    `
Player List:
${players}

Chat History:
${chatHistory}

Quests:
${quests}

Entities:
${entities}

  `,

  EDITOR_SYSTEM:
    () => `Based on the current game world state and narrative description, generate changes for the game world.

Player Input may contain:
- Player List: The List of Player Ids separated by commas
- Narrative: The last narrative generated for the game world, which can be used for continuity and reference.
- Scene Description: A brief description of the current scene, which can provide context for the changes.
- Entities: A list of existing entities in the game world.

Entity look like:
[Entity Id] entity name: entity description (entity secrets, not visible to players, secrests, behind-the-scenes mechanics, or design intentions can be included here)
- Entity Id is a unique identifier for each entity. Do not modify.

Guidelines:
- The narrative may implictly contain any changes to the world state, reflect those changes in the output entities. For example, if the narrative describes a player discovering a hidden door, you might add a new entity for the hidden door or update an existing entity to reflect that it has been discovered.
- Use the provided existing entities as references to ensure consistency in the game world.
- If you modify existing entity, use its ID as identifier.

Output format (JSON):
[
  "id": "string", // unique Identifier
  "name": "string",
  "description": "string",
  "secrets": "string", // Optional field for GM's reference, not used in gameplay
  "relations" : [{"id" : "string", "type": "string"}] // optional field for relation between entities maximum 3
]
  `,

  EDITOR: (
    players: string,
    narrative: string,
    sceneDescription: string,
    quests: string,
    // documents: string,
    // terms: string,
    entities: string,
  ) => `
Player List:
${players}

Narrative:
${narrative}

Scene Description:
${sceneDescription}
    
Quests:
${quests}


Entities:
${entities}

`,
};

export const FORMAT = {
  DOC_PROCESSOR: {
    type: "string",
  },
  WORLD_GENERATOR: {
    type: "array",
    items: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        secrets: { type: "string" },
        relations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
            },
          },
        },
      },
    },
  },
  GAME_DESIGNER: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        secrets: { type: "string" },
        relations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
            },
          },
        },
      },
    },
  },
  NARRATOR: {
    type: "object",
    properties: {
      content: { type: "string" },
      summary: { type: "string" },
    },
  },
  EDITOR: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        secrets: { type: "string" },
        relations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
            },
          },
        },
      },
    },
  },
};
