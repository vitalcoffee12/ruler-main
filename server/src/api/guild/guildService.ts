import { ServiceResponse } from "@/common/models/serviceResponse";
import { GuildRepository } from "./guildRepository";
import type { Guild } from "./guildModel";
import { StatusCodes } from "http-status-codes";
import { GenerateGuildCode } from "../utils";

export class GuildService {
  constructor(
    private guildRepository: GuildRepository = new GuildRepository(),
  ) {}

  async findAll(): Promise<ServiceResponse<Guild[] | null>> {
    try {
      const guilds = await this.guildRepository.findAll();
      if (!guilds || guilds.length === 0) {
        return ServiceResponse.failure(
          "No guilds found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<Guild[]>(
        "Guilds retrieved successfully",
        guilds,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving guilds: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByCode(code: string): Promise<ServiceResponse<Guild | null>> {
    try {
      const guild = await this.guildRepository.findByCode(code);
      if (!guild) {
        return ServiceResponse.failure(
          "Guild not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<Guild>(
        "Guild retrieved successfully",
        guild,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createGuild(createGuildData: {
    iconPath?: string;
    name: string;
    description?: string;
    ownerId: number;
  }) {
    try {
      const guildCode = GenerateGuildCode();
      const guild = await this.guildRepository.create({
        code: guildCode,
        ownerId: createGuildData.ownerId,
        name: createGuildData.name,
        description: createGuildData.description,
        iconPath: createGuildData.iconPath,
      });
      return ServiceResponse.success<Guild>(
        "Guild created successfully",
        guild,
        StatusCodes.CREATED,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error creating guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
