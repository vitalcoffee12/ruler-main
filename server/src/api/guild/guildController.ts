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
    const serviceResponse = await this.guildService.findByCode(
      req.params.code as string,
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public createGuild: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await this.guildService.createGuild(req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getGuildsByUser: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const userCode = req.query.userCode
      ? req.query.userCode.toString()
      : undefined;
    const user = { userId, userCode };
    const serviceResponse = await this.guildService.findGuildsByUser(user);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getGuildMembers: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const guildCode = req.params.code;
    // const serviceResponse = await this.guildService.findByCode(guildCode);
    // res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public joinWithCode: RequestHandler = async (req: Request, res: Response) => {
    const guildCode = req.params.code;
    // const serviceResponse = await this.guildService.inviteMembers(
    //   guildCode,
    //   members,
    // );
  };

  public sendInvitation: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {};

  public acceptInvitation: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {};
}

export const guildController = new GuildController();
