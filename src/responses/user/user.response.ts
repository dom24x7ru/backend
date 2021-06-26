import Response from "../response";
import { Flat, Invite, Person, Resident, Role, User } from "../../models";
import { DEFAULT_ACCESS } from "../../models/person/person.model";
import Cache from "../../lib/cache";

export default class UserResponse extends Response {

  mobile: string;
  banned: boolean;
  role: { id: number, name: string, };
  houseId: number;
  person: Person;
  resident: Resident;
  
  constructor(model: User) {
    super(model.id);
    this.mobile = model.mobile;
    this.banned = model.banned;
  }

  static async create(model: User) {
    let token = new UserResponse(model);
    const person = await Person.findOne({ where: { userId: model.id } });
    const role = await Role.findByPk(model.roleId);

    let resident = null;
    if (person != null) resident = await Resident.findOne({ where: { personId: person.id }, include: [{ model: Flat }] });

    if (person != null && person.access == null) {
      // устанавливаем права по-умолчанию
      person.access = DEFAULT_ACCESS;
      await person.save();
    }

    token.role = { id: role.id, name: role.name };
    token.person = person;
    token.resident = resident;

    if (token.resident != null) {
      // уже полностью сформированная учетная запись с привязкой к квартире
      token.houseId = token.resident.flat.houseId;
    } else {
      // новый пользователь, нужно взять данные у пригласившего пользователя
      const invite = await Invite.findOne({
        where: { newUserId: token.id },
        include: [
          {
            model: User,
            as: "user",
            include: [
              {
                model: Person,
                include: [
                  {
                    model: Resident,
                    include: [{ model: Flat }]
                  }
                ]
              }
            ]
          }
        ]
      });
      token.houseId = invite.user.person.residents[0].flat.houseId;
    }

    console.log(token);

    return token;
  }

  static async info(userId: number) {
    const cacheData = await Cache.getInstance().get(`user:${userId}`);
    if (cacheData != null) return JSON.parse(cacheData);
    
    const user = await User.findByPk(userId);
    if (user == null) return null;

    const token = await UserResponse.create(user);
    Cache.getInstance().set(`user:${userId}`, JSON.stringify(token));
    return token;
  }

  static async seed(action, params, socket) {
    if (socket.authToken == null) return null;
    const user = await User.findByPk(socket.authToken.id);
    if (user == null || user.banned || user.deleted) return null;

    return await UserResponse.info(socket.authToken.id);
  }
}