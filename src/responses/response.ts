import { Flat, Person, Resident, User } from "../models";

export default class Response {

  id: number;
  protected model?: any; // модель данных, если имеется, на основе которой создан объект
  protected message?: any; // дополнительные данные, например, статус и код обработки процесса

  constructor(id?: number, model?: any, message?: any) {
    this.id = id;
    this.model = model;
    this.message = message;
  }

  static async checkUser(token: any): Promise<boolean> {
    if (token == null) return false;
    const user = await User.findByPk(token.id);
    if (user == null || user.banned || user.deleted) return false;
    return true;
  }

  static async getHouseId(userId: number): Promise<number> {
    const person = await Person.findOne({
      where: { userId },
      include: [
        {
          model: Resident,
          include: [{ model: Flat }]
        }
      ]
    });
    return (person != null && person.residents.length != 0) ? person.residents[0].flat.houseId : 1;
  }
}