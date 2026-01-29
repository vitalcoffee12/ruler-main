import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { OAUTH_PROVIDERS } from "@/common/constants";

class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.findById(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public checkEmailExists: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const { email } = req.body;
    const exists = await userService.checkEmailExists(email);
    res.status(200).send({ exists });
  };

  public createUser: RequestHandler = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const serviceResponse = await userService.create({ name, email, password });
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public verifyUserEmail: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const { verificationToken } = req.body;
    const serviceResponse = await userService.verifyEmail(verificationToken);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public disableUser: RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.body;
    const serviceResponse = await userService.disable(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public blockUser: RequestHandler = async (req: Request, res: Response) => {
    const { id, blockedUntil } = req.body;
    const serviceResponse = await userService.block(id, blockedUntil);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public changeUserPassword: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const { oldPassword, newPassword } = req.body;
    const serviceResponse = await userService.changePassword(
      id,
      oldPassword,
      newPassword,
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public findAccountByEmail: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const { email } = req.body;
    const serviceResponse = await userService.findAccountByEmail(email);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public resetPassword: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const { email, newPassword, resetToken } = req.body;
    const serviceResponse = await userService.resetPassword(
      email,
      newPassword,
      resetToken,
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public refreshToken: RequestHandler = async (req: Request, res: Response) => {
    const { id, refreshToken } = req.body;
    const serviceResponse = await userService.refreshToken(id, refreshToken);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public signIn: RequestHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const serviceResponse = await userService.signIn(email, password);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public signOut: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.headers["userId"] as unknown as number;
    const serviceResponse = await userService.signOut(userId);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public loginWithOAuth: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const provider = req.params.provider as OAUTH_PROVIDERS;
    const serviceResponse = await userService.loginWithOAuth(provider);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public validateToken: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const accessToken = req.headers["Authorization"] as string;
    const refreshToken = req.headers["x-refresh-token"] as string;
    const serviceResponse = await userService.validateToken(
      accessToken,
      refreshToken,
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const userController = new UserController();
