import { GuildRepository } from "../guild/guildRepository";
import { AgentService } from "./agentService";
import { Entity, Rule } from "./gameModel";
import { GameRepository } from "./gameRepository";

export class GameService {
  constructor(
    private agentService = new AgentService(),
    private guildRepository: GuildRepository = new GuildRepository(),
    private gameRepository: GameRepository = new GameRepository(),
  ) {}

  // add entities to game world : manual
  async addEntities(
    guildCode: string,
    entities: { name: string; type: string; description: string }[],
  ) {
    await this.gameRepository.insertGameHistory(guildCode, {
      chat: {
        userId: 0, // system user
        userCode: "SYSTEM",
        message: `Entities added : ${entities[0].name} other than ${entities.length - 1}`,
      },
      entities: entities.map((e) => ({
        type: e.type,
        name: e.name,
        description: e.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        rules: [],
      })),
    });
  }

  // add entities to game world : AI generated
  async generateEntities(guildCode: string, topic: string): Promise<Entity[]> {
    const worlds = await this.gameRepository.getWorld(guildCode, 0);

    await this.agentService.generateEntities(topic);
    return [];
  }

  // find entities in game world with keywords
  async searchEntities(keywords: string[]) {
    return [];
  }

  // send message (actual game play)
  async receiveMessage(
    guildCode: string,
    userId: number,
    userCode: string,
    message: string,
    entities: Entity[],
  ) {
    await this.gameRepository.insertGameHistory(guildCode, {
      chat: {
        userId,
        userCode,
        message,
      },
      entities: [...entities],
    });
  }

  // flag up when all users have sent their messages and ready for AI agent to run
  async flagup(guildCode: string) {
    const guild = await this.guildRepository.findByCode(guildCode);
    if (!guild) {
      throw new Error(`Guild with code ${guildCode} not found`);
    }

    const sceneId = guild.sceneId;

    const gameHistories = await this.gameRepository.findGameHistoriesBySceneId(
      guildCode,
      sceneId,
    );
    const latestSceneHistories =
      await this.gameRepository.findLatestSceneHistories(guildCode);

    const rankedRules: Rule[] = [];
    const rankedTerms = new Map<string, number>();
    const rankedEntities = new Map<string, number>();

    const nar = await this.agentService.generateNarrative({
      ...gameHistories.map((gh) => ({
        role: "user",
        content: gh.chat?.message ?? "",
      })),
    });

    const rules = await this.agentService.generateRuleDescription(rankedRules);

    const edits = await this.agentService.generateEdits(nar);

    const result = await this.gameRepository.insertSceneHistory(
      guildCode,
      {
        message: nar,
        sceneDescription: `Flagged up scene ${sceneId}`,
        gameHistories,
        tasks: [],
        createdAt: new Date(),
      },
      {
        sceneId: sceneId,
        chat: {
          userId: 0,
          userCode: "system",
          message: `Scene ${sceneId} flagged up`,
        },
        entities: edits,
        createdAt: new Date(),
      },
    );

    return result;
  }
}
