import { Op } from "sequelize";
import { Document } from "../../models";
import Response from "../response";

export default class DocumentResponse extends Response {

  title: string;
  annotation: string;
  url: string;

  constructor(model: Document) {
    super(model.id);
    this.title = model.title;
    this.annotation = model.annotation;
    this.url = model.url;
  }

  static create(model: Document) {
    return new DocumentResponse(model);
  }

  static async list(userId: number) {
    const houseId = await Response.getHouseId(userId);
    const list = await Document.findAll({ where: { houseId: { [Op.or]: [houseId, null] } }, order: [["id", "desc"]] });
    if (list == null || list.length == 0) return [];
    return list.map(item => DocumentResponse.create(item));
  }

  static async seed(action, params, socket) {
    if (await Response.checkUser(socket.authToken)) {
      return await DocumentResponse.list(socket.authToken.id);
    } else {
      return [];
    }
  }
}