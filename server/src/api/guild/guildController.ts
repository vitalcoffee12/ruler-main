import { Request, RequestHandler, Response } from "express";
import { GuildService } from "./guildService";

class GuildController {
  constructor(private readonly guildService: GuildService) {}
  public getGuilds: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await this.guildService.findAll();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}
