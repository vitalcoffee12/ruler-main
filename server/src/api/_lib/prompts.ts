import { sum } from "drizzle-orm";
import { features } from "node:process";

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
  WORLD_GENERATOR_SYSTEM: (
    description: string,
  ) => `You are a game world designer.
Based on given document, generate rich game world entities.

Each entity consists of:
  - name : name of the entity
  - description : description of the entity. may contain appearance, features, traits, personality, lores or any other.
  - relations : a list of realtion the entity has. it contains target entity's id, and type of relation, describing their relation.
  
Guildlines:
   - New entities should be thematically consistent with existing ones
   - Avoid creating entities that are too similar to existing ones
   - All entities in relations need to be exist.
   - Location, Characters, Creatures, or any other Objects can be game world entity.
   - Use Player's language(Korean)

Output format (STRICT JSON):
[
  {
    "name": "string", // Edited name, should be concise and unique
    "description": "string", // Edited description, should be useful for gameplay and retrieval
    "relations" : [
      {
          "name": "string", // target entities name
          "type": "string", // relation type
          "description": "string" // description
      }
    ]
  }
]

Player want to game world be like... ${description}
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
    () => `Based on the current game world state and chat history, generate a narrative content for a text-based adventure game world.
The game is a text-based adventure game where players interact with the world through text commands and receive narrative descriptions in response. The narrative should be engaging, immersive, and consistent with the provided information.

Input may contain:
- Player Id: The Player Id
- Entities: A list of existing entities in the game world, JSON Type. It contains information of each entities.
- Current Adventure's summary

- Player message can be an action, a dialogue, or any form of interaction with the game world.
- If Entity Id is same with Player Id, it means the Entity is representing an player character.
- Entity Id is a unique identifier for each entity. Do not modify.
- If Entity Id is same with player Id, it means the entity is a player. 
- Generate narrative in players character's view
- Use Player's language.
- Do not just copy and paste previous input or narrative

Guidelines:
- Content may have :
1. Answer to player's message if it contains a question or a direct request.
2. Current scene description (background, appearance, mood, etc...) based on current game world state
3. Result of previous Player actions based on current scene
4. NPC's Reaction or Conversation If needed.
5. Provide interesting challenges, discoveries that encourage player interaction and exploration.
6. Ask player what they want to do next
7. When you talk about the player, use character name instead of player id for better immersion.

- Do not make any decision of player by yourself. 
- Cases where a player's actions/interactions or requests may fail or forced by others:
  1. Explain the reason if it is impossible logically or due to the state of the game world.
  2. NPCs may avoid communication with the player if they do not like them.
  3. Some creatures may act hostilely.
  4. If Player acts illegally or hostilely to other entities.
- A player's actions/requests may need condition to achieve. then give some interesting missions/quests for it

- Content: *Markdown* formatted narrative of current scene.
- Summary contains the whole history of the current adventure, current state of the world, or changes. Keep information as many as you can. This will be contained in the next messages for coherent narrative generation.

Output format (JSON):
{
    "content": "string", // The narrative of current scene with Markdown format.
    "summary": "string" // A summary of the current adventure and world state for coherent narrative generation
}
  `,
  NARRATOR: (
    players: string,
    playerInput: string,
    //chatHistory: string,
    //quests: string,
    // documents: string,
    // terms: string,
    summary: string,
    entities: string,
  ) =>
    `
Player Id: ${players}
Player Input: ${playerInput}

Summary: ${summary}

Game World Entities:
${entities}

  `,
  EDITOR_SYSTEM:
    () => `Based on the current game world state and narrative description, generate changes for the game world.

Input may contain:
- Player Id: The Player Id
- Narrative: The last narrative generated for the game world, which can be used for continuity and reference.
- Entities: A list of existing entities in the game world, JSON Type. It contains information of each entities.
- Current Adventure's summary

Last Narrative Contain:
  1. Answer for player's message
  2. Current scene description (background, appearance, mood, etc...) based on current game world state
  3. Result of previous Player actions based on current scene
  4. NPC's Reaction or Conversation.
  5. Interesting challenges, discoveries that encourage player interaction and exploration.

Guidelines:
- The narrative may implictly contain any changes to the world state, reflect those changes in the output entities. For example, if the narrative describes a player discovering a hidden door in such location, you might change location's description for the hidden door.
- Retain all existing information, but improve its content.
- Use the provided existing entities as references to ensure consistency in the game world.
- If you modify existing entity, use its ID as identifier.
- Unaffected entities are not modified.
- Use Player's languages

Output format (JSON):
[
  {
  "id": "string", // unique Identifier
  "name": "string",
  "description": "string",
   "relations" : [{"id" : "string", "type": "string"}] 
  }
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
Player Id:
${players}

Latest Narrative:
${narrative}

Summary:
${sceneDescription}

Game World Entities:
${entities}

`,
  CREATOR_SYSTEM:
    () => `Based on the current game world state and narrative description, generate new entities for the game world.

Input may contain:
- Player Id: The Player Id
- Narrative: The last narrative generated for the game world, which can be used for continuity and reference.
- Entities: A list of existing entities in the game world, JSON Type. It contains information of each entities.
- Current Adventure's summary

Last Narrative Contain:
  1. Answer for player's message
  2. Current scene description (background, appearance, mood, etc...) based on current game world state
  3. Result of previous Player actions based on current scene
  4. NPC's Reaction or Conversation.
  5. Interesting challenges, discoveries that encourage player interaction and exploration.

Guidelines:
- Stories may implicitly include changes in the world state, and output entities must reflect these changes. For example, if a story involves a player discovering a non-existent NPC or location, the corresponding entity must be added.
- Maintain consistency in the game world by referencing provided existing entities.
- Before outputting results, verify that the result needs to be generated.
- If no entity generated, return empty array.


Output format (JSON):
[
  {
  "name": "string",
  "description": "string",
  "relations" : [{"id" : "string", "type": "string"}] 
  }
]
  `,

  CREATOR: (
    players: string,
    narrative: string,
    sceneDescription: string,
    quests: string,
    // documents: string,
    // terms: string,
    entities: string,
  ) => `
Player Id:
${players}

Latest Narrative:
${narrative}

Summary:
${sceneDescription}

Game World Entities:
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

        relations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
              description: { type: "string" },
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
  CREATOR: {
    type: "array",
    items: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
};

// Quest look like:
// \`[Quest Id] quest description From [quest Giver Id]
// - (quest state) quest objective
// - History : quest progress history
// - Reward : quest reward list
// \`
// - Quest Id is a unique identifier for each quest. Do not modify.
