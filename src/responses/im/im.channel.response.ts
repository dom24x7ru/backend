import { Flat, IMChannel, IMChannelPerson, Person, Resident } from "../../models";
import IMMessage, { tIMMessageBody } from "../../models/im/im.message.model";
import Response from "../response";
import { getPerson, tPerson } from "../type/person.type";

export default class IMChannelResponse extends Response {

  title: string;
  private: boolean;
  lastMessage: {
    createdAt: number,
    person?: tPerson;
    body: tIMMessageBody,
  };
  count: number; // общее количество сообщений в канале
  persons: tPerson[];

  constructor(model: IMChannel) {
    super(model.id);
    this.title = model.title;
    this.private = model.private;
    this.count = 0;
    
    const messages = model.messages;
    if (messages != null && messages.length != 0) {
      const notDeletedMessages = messages.filter(msg => !msg.deleted);
      const lastMessage = notDeletedMessages.sort((msg1: IMMessage, msg2: IMMessage): number => {
        if (msg1.id > msg2.id) return -1;
        if (msg1.id < msg2.id) return 1;
        return 0;
      })[0];
      
      this.lastMessage = {
        createdAt: lastMessage.createdAt.getTime(),
        body: lastMessage.body
      };

      if (lastMessage.personId != null) this.lastMessage.person = getPerson(lastMessage.person);

      this.count = notDeletedMessages.length;
    }
  }

  static async create(model: IMChannel) {
    let response = new IMChannelResponse(model);
    if (response.private) {
      // передаем данные об участниках приватного чата
      const channelsPersons = await IMChannelPerson.findAll({
        where: { channelId: model.id },
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
      });
      response.persons = channelsPersons.map(channelPerson => getPerson(channelPerson.person));
    }
    return response;
  }

  static async get(channelId: number) {
    const channel = await IMChannel.findByPk(channelId, { include: IMChannelResponse.include() })
    if (channel == null) return null;
    return IMChannelResponse.create(channel);
  }

  static async list(userId: number) {
    const person = await Person.findOne({ where: { userId } });
    if (person == null) return [];

    const channelsPersons = await IMChannelPerson.findAll({
      where: { personId: person.id },
      include: [{ model: IMChannel, include: IMChannelResponse.include() }]
    });
    if (channelsPersons == null || channelsPersons.length == 0) return [];
    let list = [];
    for (let item of channelsPersons) {
      const response = await IMChannelResponse.create(item.channel);
      list.push(response);
    }
    return list.sort((ch1: IMChannelResponse, ch2: IMChannelResponse): number => {
      if (ch1.lastMessage == null || ch2.lastMessage == null) return 0;
      if (ch1.lastMessage.createdAt > ch2.lastMessage.createdAt) return 1;
      if (ch1.lastMessage.createdAt < ch2.lastMessage.createdAt) return -1;
      return 0;
    });
  }

  static async seed(action, params, socket) {
    if (await Response.checkUser(socket.authToken)) {
      return await IMChannelResponse.list(socket.authToken.id);
    } else {
      return [];
    }
  }

  private static include() {
    return [
      {
        model: IMMessage,
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
    ];
  }
}