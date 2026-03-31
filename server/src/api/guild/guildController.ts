import { Request, RequestHandler, Response } from "express";
import { GuildService } from "./guildService";
import { socketHandler } from "../_lib/socketHandler";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

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
    console.log(req.body);
    const iconPath = (req as any).files["iconPath"]
      ? (req as any).files["iconPath"][0]
      : null;
    const attachment = (req as any).files["attachment"]
      ? (req as any).files["attachment"][0]
      : null;
    console.log(iconPath, attachment);
    const serviceResponse = await this.guildService.createGuild({
      ...req.body,
      iconPath: iconPath?.filename ?? null,
      attachment: attachment?.filename ?? null,
    });
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getGuildsByUser: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const userId = req.headers["userId"] as string; // Assuming the user info is passed in the header as a JSON string

    const serviceResponse = await this.guildService.findGuildsByUser(
      Number(userId),
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getGuildMembers: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const guildCode = req.params.code as string;
    const result = await this.guildService.findMembersByGuild({
      guildCode,
    });
    const sr = ServiceResponse.success(
      "guildMemberfetch",
      result,
      StatusCodes.OK,
    );
    res.status(sr.statusCode).send(sr);
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
  ) => {
    const { guildCode, userId } = req.body;
    const servicecResponse = await this.guildService.inviteMember(
      guildCode,
      userId,
    );
    socketHandler.sendHistoryUpdate(guildCode);
    socketHandler.sendMemberList(guildCode);

    res.status(servicecResponse.statusCode).send(servicecResponse);
  };

  public acceptInvitation: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {};
}

export const guildController = new GuildController();
