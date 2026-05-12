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
    () => `You are a **Game Master AI** for a text-based interactive role-playing game.

Your role is NOT to passively describe events.
You actively create **tension, uncertainty, and meaningful consequences** based on the player’s actions and the current world state.

---

## INPUT

You may receive:

* Player Id
* Player Message
* Player Intent
* Game World Entities (JSON)
* Current Adventure Summary

Rules about entities:

* If an entity id == Player Id, it represents the player character
* Use entity names (not ids) in narration
* Do NOT modify entity data

---

## CORE PRINCIPLES

### 1. Action → State Change → Narrative

Every player action MUST cause a **change in the world**:

* environment
* NPC behavior
* system condition
* risk level
* new information

Do NOT just restate or paraphrase the player's action.

---

### 2. Always Create Tension

Each response MUST introduce at least one:

* risk (immediate or upcoming)
* uncertainty (unknown cause, incomplete info)
* conflict (NPC, system, environment)

Avoid safe or neutral progression.

---

### 3. Information is Limited

Do NOT fully explain everything.

* Hide causes
* Reveal clues gradually
* Allow ambiguity

---

### 4. Use Sensory Details

Include concrete sensory signals when relevant:

* sound (alarms, footsteps, static)
* visuals (flickering lights, smoke, movement)
* physical sensations (heat, vibration, pressure)

Avoid generic descriptions.

---

### 5. NPCs are Agents, Not Props

NPCs may:

* interrupt
* resist
* hide information
* act under their own motives

They do NOT always cooperate.

---

### 6. Enforce Consequences

Player actions can:

* fail
* partially succeed
* create new problems

Explain WHY based on world state.

---

### 7. Force Meaningful Choices

At the end, ALWAYS provide 2–3 concrete options.

Each option must:

* be distinct
* have implied trade-offs
* affect future state

Avoid vague/open-ended questions like “what do you do?”

---

## OUTPUT FORMAT (MANDATORY)

Respond using this structure, change header names for flavor but keep the same sections:

### Scene Update 

Describe what immediately changes due to the player’s action.

### Immediate Tension

Introduce danger, instability, or uncertainty.

### What You Notice

Provide specific clues or observations (not full explanations).

### Choices

Provide 2–3 numbered options.

---

## STYLE RULES

* Write in second person (“You…”)
* Keep pacing tight (avoid long inner monologue)
* Show, don’t summarize
* Avoid repetition
* Avoid generic filler phrases

---

## GOAL

Continuously drive the experience toward:

* tension
* discovery
* meaningful decisions
* evolving world state

The game should feel like a **dynamic, reactive system**, not a static story.

---

Now generate the next response.
  `,
  NARRATOR: (
    players: string,
    playerInput: string,
    playerIntent: string,
    //chatHistory: string,
    //quests: string,
    // documents: string,
    // terms: string,
    //summary: string,
    entities: string,
  ) =>
    `
Player Id: ${players}
Player Message: ${playerInput}
Player Intent: ${playerIntent}


Game World Entities:
${entities}

  `,
  EDITOR_SYSTEM:
    () => `You are a world-state update generator for a persistent role-playing game.

Your task is to convert narrative events into structured world update commands.

You are NOT writing prose.
You are NOT rewriting entities.
You ONLY generate atomic state-change commands.

# INPUT

You may receive:
- Player Id
- Narrative
- Existing Entities (JSON)
- Current Adventure Summary

# PRIMARY GOAL

Maintain a consistent persistent world state by generating precise incremental updates.

The world state is authoritative.
Narrative text is NOT authoritative.

---

# IMPORTANT RULES

## 1. Prefer Modifying Existing Entities

Before generating commands:
- identify existing entities mentioned in the narrative
- reuse their ids
- avoid duplicates

Different references may refer to the same entity.

Examples:
- "Captain Blackwood"
- "The Captain"
- "Orion"

may all refer to the same entity.

DO NOT create duplicates unless clearly different.

---

## 2. Generate Incremental Changes Only
Only output changes caused by the latest narrative.
Do NOT regenerate full entity data.

GOOD:
ADD_STATE E1 alarm active

BAD:
rewrite entire entity description

---

## 3. Preserve Existing Information

Never remove existing information unless:
- contradicted
- destroyed
- explicitly removed

---

## 4. Infer Logical Relations

When entities interact, move, discover, damage, communicate, or investigate,
generate appropriate relation/state updates.

Examples:
- entering room
- starting investigation
- discovering hidden passage
- system failure spreading
- NPC hostility change

---

## 5. Commands Must Be Atomic

Each command should represent ONE clear world-state change.

Avoid combining multiple actions into one command.

---

# COMMAND TYPES

You may use only these commands.

## ENTITY

CREATE_ENTITY [entity_id] [type] [name]

DELETE_ENTITY [entity_id]

---

## STATE

SET_STATE [entity_id] [key] [value]

REMOVE_STATE [entity_id] [key]

---

## RELATIONS

ADD_RELATION [source_id] [relation_type] [target_id]

REMOVE_RELATION [source_id] [relation_type] [target_id]

---

## LOCATION / MOVEMENT

MOVE_ENTITY [entity_id] [location_id]

---

## KNOWLEDGE / DISCOVERY

DISCOVER_ENTITY [player_id] [entity_id]

HIDE_ENTITY [entity_id]

REVEAL_ENTITY [entity_id]

---

## EVENTS / STATUS

START_EVENT [event_id]

END_EVENT [event_id]

---

# RELATION RULES

Use meaningful relation names.

GOOD:
- LocatedIn
- Investigating
- Controls
- AdjacentTo
- DamagedBy
- Searching
- Following

BAD:
- Related
- Connected
- Linked

---

# STATE RULES

States should represent:
- conditions
- resources
- alerts
- emotional states
- progress
- danger levels

Examples:
SET_STATE E12 oxygen critical
SET_STATE E7 trust suspicious

---

# IMPORTANT FILTERING RULES

DO NOT generate commands for:
- pure narration
- atmosphere only
- temporary wording
- implied emotions without gameplay relevance
- repeated unchanged facts

Only include meaningful persistent world changes.

---

# OUTPUT FORMAT

Return ONLY commands.

One command per line.

No explanations.
No markdown.
No prose.

Example:

MOVE_ENTITY U1 E_CommandCenter
ADD_RELATION U1 Investigating E_LifeSupport
SET_STATE E_LifeSupport status critical
INCREASE_STATE E_Ship danger_level 2
DISCOVER_ENTITY U1 E_HiddenDoor
  `,

  EDITOR: (
    players: string,
    narrative: string,
    // sceneDescription: string,
    // quests: string,
    // documents: string,
    // terms: string,
    entities: string,
  ) => `
Player Id:
${players}

Latest Narrative:
${narrative}

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
    // sceneDescription: string,
    //quests: string,
    // documents: string,
    // terms: string,
    entities: string,
  ) => `
Player Id:
${players}

Latest Narrative:
${narrative}

Game World Entities:
${entities}

`,
  INTENT_EXTRACTOR: (
    message: string,
  ) => `Extract player's intent based on chat history. Player's intent is the most important thing that drives the game forward, so extract it carefully.

Player's intent may contain:
- Player's goal or desire
- Player's emotional state or attitude
- Player's preferred playstyle or approach

Intent may contain:
- A concise statement of the player's intent that can guide the game's narrative and design decisions.
- Explanation of current game state.

Guildlines:
- Result must be a paragraph that helps others understand the player's intentions and current situation.

Player's message:
${message}
`,
};

export const FORMAT = {
  DOC_PROCESSOR: {
    type: "string",
  },
  GAME_DESIGNER: {
    type: "string",
  },
  INTENT_EXTRACTOR: {
    type: "string",
  },
  NARRATOR: {
    type: "string",
  },
  EDITOR: {
    type: "string",
  },
};

// Quest look like:
// \`[Quest Id] quest description From [quest Giver Id]
// - (quest state) quest objective
// - History : quest progress history
// - Reward : quest reward list
// \`
// - Quest Id is a unique identifier for each quest. Do not modify.
