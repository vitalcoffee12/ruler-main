import type { Request, RequestHandler, Response } from "express";
import { resourceService } from "./resourceService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

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
    console.log(
      "Uploading resource by writer:",
      writer,
      "with data:",
      resourceData,
    );

    const serviceResponse = await resourceService.upload(writer, resourceData);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public formatResource: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    const { id } = req.body;
    resourceService.format(id);
    const serviceResponse = ServiceResponse.success<boolean>(
      "Request to format resource successfully received",
      true,
      StatusCodes.OK,
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const resourceController = new ResourceController();
