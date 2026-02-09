import { Request, RequestHandler, Response } from "express";
import { GameService } from "./gameService";

class GameController {
  constructor(private readonly gameService: GameService = new GameService()) {}
  // public sendChat: RequestHandler = async (req: Request, res: Response) => {
  //   const serviceResponse = await this.gameService.findAll();
  //   res.status(serviceResponse.statusCode).send(serviceResponse);
  // };
}

export const gameController = new GameController();
