import Cache from "../lib/cache";
import Push from "../lib/push";
import { Flat, IMChannel, IMChannelPerson, IMMessage, IMMessageShow, NotificationToken, Person, Resident, User } from "../models";
import { IMMessageResponse } from "../responses";
import ResponseUpdate from "../responses/response.update";
import errors from "./errors";

export async function save({ messageId, channelId, body }, respond) {
  console.log(">>>>> actions/im.save");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);
    
    const person = await Person.findOne({ where: { userId: this.authToken.id } });

    const channelPerson = await IMChannelPerson.findOne({ where: { channelId, personId: person.id } });
    if (channelPerson == null) throw new Error(errors.im["001"].code);

    let message: IMMessage = null;
    if (messageId == null) {
      // создаем новое сообщение
      message = await IMMessage.create({ personId: person.id, channelId, body });
      await IMMessageShow.create({ personId: person.id, messageId: message.id });

      // отправляем нотификации всем, подписанным на группу
      const channel = await IMChannel.findByPk(channelId);
      const persons = await IMChannelPerson.findAll({ where: { channelId, mute: false }, include: [{ model: Person }] });
      const userIds = persons.map(item => item.person.userId);
      const tokens = await NotificationToken.findAll({ where: { userId: userIds } });
      if (tokens != null) {
        for (let item of tokens) {
          // не отправлять пользователю, который создал сообщение
          if (item.userId != this.authToken.id) {
            Push.send({ body: `Новое сообщение в чате "${channel.title}"`, uri: `/im/${channelId}`, to: item.token });
          }
        }
      }
    } else {
      // редактируем сообщение
      message = await IMMessage.findOne({ where: { id: messageId, personId: person.id } });
      if (message == null) throw new Error(errors.im["002"].code);
      message.body = body;
      await message.save();
    }

    Cache.getInstance().clear(`imMessages:${channelId}`);

    // обновляем канал с группами чатов и конкретную группу
    const responseUpdate = new ResponseUpdate(this.exchange);
    responseUpdate.update({
      userId: this.authToken.id,
      createAt: new Date(),
      type: "IM.SAVE",
      status: "SUCCESS",
      data: JSON.stringify({ channelId, messageId: message.id, event: "create" })
    });

    respond(null, { status: "OK" });
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

export async function shown({ messageId }, respond) {
  console.log(">>>>> actions/im.shown");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);

    const person = await Person.findOne({ where: { userId: this.authToken.id } });

    const message = await IMMessage.findByPk(messageId);
    if (message == null) throw new Error(errors.im["002"].code);

    await IMMessageShow.create({ personId: person.id, messageId });

    // обновляем канал с группами чатов и конкретную группу
    const responseUpdate = new ResponseUpdate(this.exchange);
    await responseUpdate.update({
      userId: this.authToken.id,
      createAt: new Date(),
      type: "IM.SHOWN",
      status: "SUCCESS",
      data: JSON.stringify({ channelId: message.channelId, messageId, event: "create" })
    });

    respond(null, { status: "OK" });
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

export async function del ({ messageId }, respond) {
  console.log(">>>>> actions/im.del");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);

    const person = await Person.findOne({ where: { userId: this.authToken.id } });

    const message = await IMMessage.findOne({ where: { id: messageId, personId: person.id } });
    if (message == null) throw new Error(errors.im["002"].code);

    message.deleted = true;
    await message.save();

    Cache.getInstance().clear(`imMessages:${message.channelId}`);

    // обновляем канал с группами чатов и конкретную группу
    const responseUpdate = new ResponseUpdate(this.exchange);
    await responseUpdate.update({
      userId: this.authToken.id,
      createAt: new Date(),
      type: "IM.MSG.DEL",
      status: "SUCCESS",
      data: JSON.stringify({ channelId: message.channelId, messageId, event: "destroy" })
    });

    respond(null, { status: "OK" });
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

export async function load({ channelId, limit, offset }, respond) {
  console.log(">>>>> actions/im.load");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);

    const person = await Person.findOne({ where: { userId: this.authToken.id } });

    const channelPerson = await IMChannelPerson.findOne({ where: { channelId, personId: person.id } });
    if (channelPerson == null) throw new Error(errors.im["001"].code);

    const messages = await IMMessageResponse.list(channelId, this.authToken.id, limit, offset, false);
    respond(null, messages);
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

export async function getMute({ channelId }, respond) {
  console.log(">>>>> actions/im.getMute");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);

    const person = await Person.findOne({ where: { userId: this.authToken.id } });

    const channelPerson = await IMChannelPerson.findOne({ where: { channelId, personId: person.id } });
    if (channelPerson == null) throw new Error(errors.im["001"].code);

    respond(null, { mute: channelPerson.mute });
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

export async function setMute({ channelId, mute }, respond) {
  console.log(">>>>> actions/im.setMute");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);

    const person = await Person.findOne({ where: { userId: this.authToken.id } });

    const channelPerson = await IMChannelPerson.findOne({ where: { channelId, personId: person.id } });
    if (channelPerson == null) throw new Error(errors.im["001"].code);

    channelPerson.mute = mute;
    channelPerson.save();

    respond(null, { mute: channelPerson.mute });
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

export async function createPrivateChannel({ personId }, respond) {
  console.log(">>>>> actions/im.createPrivateChannel");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);
    
    const person = await Person.findOne({ where: { userId: this.authToken.id } });

    if (person.id == personId) throw new Error(errors.im["003"].code);

    // в начале нужно проверить, что уже имеется приватный канал, а не сразу создавать его
    const getPrivateChannel = async (personIds: number[]): Promise<IMChannel> => {
      const channels = await IMChannel.findAll({ where: { private: true }, include: [{ model: IMChannelPerson }] });
      for (let channel of channels) {
        if (channel.persons.length == personIds.length) {
          // количество участников совпадает, и нужно проверить, что участники именно те, что нужно
          let status = true;
          for (let channelPerson of channel.persons) {
            if (personIds.indexOf(channelPerson.personId) == -1) status = false;
          }
          if (status) return channel;
        }
      }
      return null;
    };

    let channel: IMChannel = await getPrivateChannel([person.id, personId]);
    if (channel == null) {
      const resident = await Resident.findOne({ where: { personId: person.id }, include: [{ model: Flat }] });
      channel = await IMChannel.create({ houseId: resident.flat.houseId, private: true });
      IMChannelPerson.create({ channelId: channel.id, personId: person.id });
      IMChannelPerson.create({ channelId: channel.id, personId });

      // обновляем канал "imChannel"
      const responseUpdate = new ResponseUpdate(this.exchange);
      responseUpdate.update({
        userId: this.authToken.id,
        createAt: new Date(),
        type: "IM.CHANNEL.UPDATE",
        status: "SUCCESS",
        data: JSON.stringify({ channelId: channel.id, event: "create" })
      });
    }

    respond(null, { status: "OK", channelId: channel.id });
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}