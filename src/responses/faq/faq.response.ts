import { Op } from "sequelize";
import { FAQCategory, FAQItem } from "../../models";
import Response from "../response";

export default class FAQResponse extends Response {

  title: string;
  body: string;
  category: {
    id: number,
    name: string,
    description: string
  }

  constructor(model: FAQItem) {
    super(model.id);
    this.title = model.title;
    this.body = model.body;
    this.category = {
      id: model.category.id,
      name: model.category.name,
      description: model.category.description
    };
  }

  static create(model: FAQItem) {
    return new FAQResponse(model);
  }

  static async list(userId: number) {
    const houseId = await Response.getHouseId(userId);
    const list = await FAQItem.findAll({ include: [{ model: FAQCategory, where: { houseId: { [Op.or]: [houseId, null] } } }], order: [["id", "desc"]] });
    if (list == null || list.length == 0) return [];
    return list.map(item => FAQResponse.create(item));
  }

  static async seed(action, params, socket) {
    if (await Response.checkUser(socket.authToken)) {
      return await FAQResponse.list(socket.authToken.id);
    } else {
      return [];
    }
  }
}