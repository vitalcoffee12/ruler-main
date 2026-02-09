import mongoose from "mongoose";
import { GameRepository } from "./gameRepository";
import fs from "fs";
import { Rule } from "./gameModel";
import { GenerateRuleSetCode } from "../utils";

export class RuleService {
  constructor(private gameRepository: GameRepository = new GameRepository()) {}

  // split markdown into nested rules (4)
}
