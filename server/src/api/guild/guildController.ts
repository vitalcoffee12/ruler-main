import { Request, RequestHandler, Response } from "express";

class GuildController {
  public getGuilds: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await guildService.getGuilds();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}
