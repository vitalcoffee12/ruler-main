import { Request, RequestHandler, Response } from "express";
import { GuildService } from "./guildService";

class GuildController {
  constructor(
    private readonly guildService: GuildService = new GuildService(),
  ) {}
  public getGuilds: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await this.guildService.findAll();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getGuild: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await this.guildService.findByCode(req.params.code);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public createGuild: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await this.guildService.createGuild(req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const guildController = new GuildController();
