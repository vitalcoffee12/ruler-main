import type { Request, RequestHandler, Response } from "express";
import { resourceService } from "./resourceService";

class ResourceController {
  public getResources: RequestHandler = async (
    _req: Request,
    res: Response,
  ) => {
    const serviceResponse = await resourceService.findAll();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getResourceById: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const id = Number(req.params.id);
    const serviceResponse = await resourceService.findById(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public uploadResource: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const { writer, resourceData } = req.body;
    console.log(writer, resourceData);

    const serviceResponse = await resourceService.upload(writer, resourceData);
    return;
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const resourceController = new ResourceController();
