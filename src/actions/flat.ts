import { Flat, Person, Resident, User } from "../models";
import { DEFAULT_ACCESS } from "../models/person/person.model";
import errors from "./errors";

export async function info({ flatNumber }, respond) {
  console.log(">>>>> actions/flat.info");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);

    const houseId = await getHouseId(this.authToken.id);
    const flat = await Flat.findOne({ where: { houseId, number: flatNumber } });
    if (flat == null) throw new Error(errors.flat["001"].code);
    const residents = await Resident.findAll({ where: { flatId: flat.id }, include: [{ model: Person, include: [{ model: User }] }] });
    let result = [];
    for (let resident of residents) {
      const person = resident.person;
      if (person.access == null) {
        person.access = DEFAULT_ACCESS;
        await person.save();
      }
      const access = person.access;
      const info = { personId: person.id, surname: null, name: null, midname: null, deleted: person.user.deleted, mobile: null, telegram: null };
      if (access.name.level == "all") {
        if (access.name.format == "all") {
          info.surname = person.surname;
          info.name = person.name;
          info.midname = person.midname;
        } else if (access.name.format == "name") {
          info.name = person.name;
        }
      }
      if (access.mobile.level == "all") {
        info.mobile = person.user.mobile;
      }
      if (access.telegram.level == "all") {
        info.telegram = person.telegram;
      }
      result.push(info);
    }
    respond(null, result);
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

async function getHouseId(userId: number): Promise<number> {
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