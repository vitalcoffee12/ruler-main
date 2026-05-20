import { Request, RequestHandler, Response } from "express";
import { GameService } from "./gameService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

class GameController {
  constructor(private readonly gameService: GameService = new GameService()) {}

  public addElement: RequestHandler = async (req: Request, res: Response) => {
    const { guildCode, element } = req.body;
    const serviceResponse = await this.gameService.addElement(
      guildCode,
      element,
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public requestElement: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const { guildCode, description } = req.body;
    this.gameService.requestElement(guildCode as string, description);
    const serviceResponse = ServiceResponse.success<boolean>(
      "Request to add element successfully received",
      true,
      StatusCodes.OK,
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public updateElement: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const { guildCode, elementName, element } = req.body;
    const serviceResponse = await this.gameService.updateElement(
      guildCode as string,
      elementName as string,
      element,
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getElementById: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const { guildCode, elementId } = req.params;
    const serviceResponse = await this.gameService.getElementById(
      guildCode as string,
      elementId as string,
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public sendMessage: RequestHandler = async (req: Request, res: Response) => {
    const { userId, guildCode, message } = req.body;
    console.log("Received message:", { userId, guildCode, message });

    const serviceResponse = await this.gameService.sendMessage(
      userId as number,
      guildCode as string,
      message,
    );
    this.gameService.processMessage(
      userId as number,
      guildCode as string,
      message,
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getWorld: RequestHandler = async (req: Request, res: Response) => {
    const { guildCode, page } = req.body;
    const serviceResponse = await this.gameService.getWorld(
      guildCode as string,
      parseInt(page as string, 10) || 1,
    );
    console.log("Service Response:", serviceResponse);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getChat: RequestHandler = async (req: Request, res: Response) => {
    const { guildCode, page } = req.body;
    const serviceResponse = await this.gameService.getChat(
      guildCode as string,
      1,
    );
    console.log("Service Response:", serviceResponse);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const gameController = new GameController();
