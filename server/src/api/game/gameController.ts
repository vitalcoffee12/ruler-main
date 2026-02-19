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
    this.gameService.requestElement(guildCode, description);
    const serviceResponse = ServiceResponse.success<boolean>(
      "Request to add element successfully received",
      true,
      StatusCodes.OK,
    );

    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const gameController = new GameController();
