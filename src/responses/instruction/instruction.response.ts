import { Instruction } from "../../models";
import Response from "../response";
import { iInstructionItem } from "../../models/instruction/instruction.model";
import { Op } from "sequelize";

export default class InstructionResponse extends Response {

  title: string;
  subtitle: string;
  body: iInstructionItem[];

  constructor(model: Instruction) {
    super(model.id);
    this.title = model.title;
    this.subtitle = model.subtitle;
    this.body = model.body;
  }

  static create(model: Instruction) {
    return new InstructionResponse(model);
  }

  static async list(userId: number) {
    const houseId = await Response.getHouseId(userId);
    const instructions = await Instruction.findAll({ where: { houseId: { [Op.or]: [houseId, null] } }, order: [["id", "desc"]] });
    if (instructions == null || instructions.length == 0) return [];
    return instructions.map(instruction => InstructionResponse.create(instruction));
  }

  static async seed(action, params, socket) {
    if (await Response.checkUser(socket.authToken)) {
      return await InstructionResponse.list(socket.authToken.id);
    } else {
      return []
    }
  }
}