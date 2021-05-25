import Cache from "../../lib/cache";
import { Flat, IMChannel, IMChannelPerson, IMMessage, Person, Resident, User } from "../../models";
import { tIMMessageBody } from "../../models/im/im.message.model";
import Response from "../response";
import { tPerson, getPerson } from "../type/person.type";

export default class IMMessageResponse extends Response {

  createdAt: number;
  updatedAt: number;
  person: tPerson;
  channel: {
    id: number,
    title: string,
  };
  body: tIMMessageBody;

  constructor(model: IMMessage) {
    super(model.id);
    this.createdAt = model.createdAt.getTime();
    this.updatedAt = model.updatedAt.getTime();
    if (model.personId != null) this.person = getPerson(model.person);
    this.channel = {
      id: model.channel.id,
      title: model.channel.title
    };
    this.body = model.body;
  }

  static async create(model: IMMessage) {
    let message = new IMMessageResponse(model);
    if (message.body.aMessage != null) {
      message.body.aMessage = await IMMessageResponse.get(message.body.aMessage.id);
    }
    return message;
  }

  static async get(messageId: number) {
    const message = await IMMessage.findByPk(messageId, { include: IMMessageResponse.include() });
    if (message == null) return null;
    return await IMMessageResponse.create(message);
  }

  static async list(channelId: number, userId: number, limit: number = 20, offset: number = 0, withCache: boolean = true) {
    if (withCache) {
      const cacheData = await Cache.getInstance().get(`imMessages:${channelId}`);
      if (cacheData != null) return JSON.parse(cacheData);
    }
    
    const person = await Person.findOne({ where: { userId } });
    if (person == null) return [];
    // проверяем, что пользователь подписан на канал
    const personChannel = await IMChannelPerson.findOne({ where: { channelId, personId: person.id } });
    if (personChannel == null) return [];

    const messages = await IMMessage.findAll({ where: { channelId, deleted: false }, include: IMMessageResponse.include(), order: [["id", "desc"]], limit, offset });
    if (messages == null || messages.length == 0) return [];
    
    let list: IMMessageResponse[] = [];
    for (let message of messages) {
      const item = await IMMessageResponse.create(message);
      list.unshift(item);
    }

    if (withCache) Cache.getInstance().set(`imMessages:${channelId}`, JSON.stringify(list));
    return list;
  }

  static async seed(action, params, socket) {
    if (socket.authToken == null) return [];
    const user = await User.findByPk(socket.authToken.id);
    if (user == null || user.banned || user.deleted) return [];
    
    return await IMMessageResponse.list(params[0], socket.authToken.id);
  }

  private static include() {
    return [
      { model: IMChannel },
      {
        model: Person,
        include: [
          {
            model: Resident,
            include: [{ model: Flat }]
          }
        ]
      }
    ];
  }
}