import { Flat, Person, Resident, User } from "../../models";
import Response from "../response";
import { getPerson } from "../type/person.type";

interface iResident {
  personId: number;
  surname: string;
  name: string;
  midname: string;
  deleted: boolean;
}

export default class FlatResponse extends Response {

  number: number;
  floor: number;
  section: number;
  rooms: number;
  square: number;
  residents: iResident[];

  constructor(model: Flat) {
    super(model.id);
    this.number = model.number;
    this.floor = model.floor;
    this.section = model.section;
    this.rooms = model.rooms;
    this.square = model.square;
    this.residents = [];
    model.residents.forEach(resident => {
      const person = getPerson(resident.person);
      this.residents.push({
        personId: person.id,
        surname: person.surname,
        name: person.name,
        midname: person.midname,
        deleted: person.deleted
      });
    });
  }

  static create(model: Flat) {
    return new FlatResponse(model);
  }

  static async list(userId: number) {
    const houseId = await Response.getHouseId(userId);
    const list = await Flat.findAll({
      where: { houseId },
      include: [{ model: Resident, include: [{ model: Person, include: [{ model: User }] }] }],
      order: ["id"]
    });
    if (list == null || list.length == 0) return [];
    return list.map(flat => FlatResponse.create(flat));
  }

  static async seed(action, params, socket) {
    if (await Response.checkUser(socket.authToken)) {
      return await FlatResponse.list(socket.authToken.id);
    } else {
      return [];
    }
  }
}