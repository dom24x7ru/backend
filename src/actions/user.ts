import { User, Person, Resident, Flat, Invite, Post, Role, Vote, VotePerson, IMChannel, IMChannelPerson, IMMessage } from "../models";
import * as numeral from "numeral";
import SMSC from "../lib/smsc";
import errors from "./errors";
import ResponseUpdate from "../responses/response.update";
import Push from "../lib/push";
import Cache from "../lib/cache";

export async function auth({ mobile, invite, code }, respond) {
  console.log(">>>>> actions/user.auth");
  try {
    let user = await User.findOne({ where: { mobile } });
    if (user == null) {
      if (invite == null) {
        throw new Error(errors.user["003"].code);
      } else {
        // проверяем корректность кода приглашения и, если все хорошо, то регистрируем нового пользователя
        let inviteDb = await Invite.findOne({ where: { code: invite, used: false } });
        if (inviteDb == null) throw new Error(errors.invite["001"].code);
        user = await User.create({ mobile, roleId: 2 }); // 2 - USER
        inviteDb.used = true;
        inviteDb.newUserId = user.id;
        await inviteDb.save();
      }
    } else {
      if (invite != null) throw new Error(errors.invite["002"].code);
    }
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);

    if (code == null) {
      // формируем и отправляем одноразовый код авторизации по смс
      user.smsCode = generateCode(4);
      await user.save();
      await SMSC.send([mobile], user.smsCode);

      respond(null, { status: "OK" });
    } else {
      // проверяем, что код авторизации совпадает с присланным
      if (user.smsCode != code) throw new Error(errors.user["001"].code);
      // все хорошо
      const token = await newToken(user);
      this.setAuthToken(token);
      respond(null, token);
    }
  } catch (error) {
    console.error(error)
    respond(errors.methods.check(errors, error.message));
  }
}

export async function logout(params, respond) {
  console.log(">>>>> actions/user.logout");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    this.deauthenticate();
    respond(null, true);
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

export async function invite(params, respond) {
  console.log(">>>>> actions/user.invite");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);

    let code = null;
    let inviteDb = null;
    do {
      code = generateCode(6);
      inviteDb = await Invite.findOne({ where: { code } });
    } while (inviteDb != null);
    inviteDb = await Invite.create({ userId: this.authToken.id, code });

    // обновляем канал "invites"
    const responseUpdate = new ResponseUpdate(this.exchange);
    responseUpdate.update({
      userId: this.authToken.id,
      createAt: new Date(),
      type: "INVITE.SAVE",
      status: "SUCCESS",
      data: JSON.stringify({ inviteId: inviteDb.id, event: "create" })
    });

    respond(null, { id: inviteDb.id, code });
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

export async function saveProfile({ surname, name, midname, telegram, flat, access }, respond) {
  console.log(">>>>> actions/user.saveProfile");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);
    
    const flatDb = await Flat.findByPk(flat);
    if (flatDb == null) throw new Error(errors.flat["001"].code);

    let person = await Person.findOne({ where: { userId: this.authToken.id } });
    if (person == null) {
      // только что зарегистрировались и еще нет профиля
      person = await Person.create({ userId: this.authToken.id, surname: surname, name: name, midname: midname, telegram: telegram, access: access });
    } else {
      // обновляем только данные по персоне, изменения по квартире пока игнорируем
      person.surname = surname;
      person.name = name;
      person.midname = midname;
      person.telegram = telegram;
      person.access = access;
      await person.save();
    }

    let resident = await Resident.findOne({ where: { personId: person.id }, include: [{ model: Flat }] });
    if (resident == null) {
      await Resident.create({ personId: person.id, flatId: flat });

      // проверяем активные голосования и, при необходимости, добавляем в нужные
      try {
        const votes = await Vote.findAll({ where: { closed: false } });
        if (votes != null) {
          for (let vote of votes) {
            if (vote.allHouse) {
              // голосование на весь дом
              const votePerson = await VotePerson.findOne({ where: { voteId: vote.id, personId: person.id } });
              if (votePerson == null) {
                VotePerson.create({ voteId: vote.id, personId: person.id });
              }
            } else {
              // голосование на подъезд, либо этаж
              if (resident.flat.section == vote.section) {
                if (vote.floor != null) {
                  // голосование на этаж
                  if (resident.flat.floor == vote.floor) {
                    const votePerson = await VotePerson.findOne({ where: { voteId: vote.id, personId: person.id } });
                    if (votePerson == null) {
                      VotePerson.create({ voteId: vote.id, personId: person.id });
                    }
                  }
                } else {
                  // голосование на подъезд
                  const votePerson = await VotePerson.findOne({ where: { voteId: vote.id, personId: person.id } });
                  if (votePerson == null) {
                    VotePerson.create({ voteId: vote.id, personId: person.id });
                  }
                }
              }
            }
          }
          Cache.getInstance().clear("votes:*");
        }
      } catch (error) {
        console.error(error.message);
      }

      const responseUpdate = new ResponseUpdate(this.exchange);

      // добавляем пользователя в чаты
      try {
        const flatDb = await Flat.findByPk(flat);
        const flatTxt = `кв. ${flatDb.number}, этаж ${flatDb.floor}, подъезд ${flatDb.section}`;

        // в общедомовой
        let channel = await IMChannel.findOne({ where: { allHouse: true } });
        IMChannelPerson.create({ channelId: channel.id, personId: person.id });
        IMMessage.create({ channelId: channel.id, body: { text: `Сосед(ка) из ${flatTxt} вступил(а) в группу` } });
        Cache.getInstance().clear(`imMessages:${channel.id}`);
        // обновляем канал "imChannel"
        responseUpdate.update({
          userId: this.authToken.id,
          createAt: new Date(),
          type: "IM.CHANNEL.UPDATE",
          status: "SUCCESS",
          data: JSON.stringify({ channelId: channel.id, event: "update" })
        });

        // в чат секции
        channel = await IMChannel.findOne({ where: { section: flatDb.section, floor: null } });
        IMChannelPerson.create({ channelId: channel.id, personId: person.id });
        IMMessage.create({ channelId: channel.id, body: { text: `Сосед(ка) из ${flatTxt} вступил(а) в группу` } });
        Cache.getInstance().clear(`imMessages:${channel.id}`);
        // обновляем канал "imChannel"
        responseUpdate.update({
          userId: this.authToken.id,
          createAt: new Date(),
          type: "IM.CHANNEL.UPDATE",
          status: "SUCCESS",
          data: JSON.stringify({ channelId: channel.id, event: "update" })
        });

        // в чат этажа
        channel = await IMChannel.findOne({ where: { section: flatDb.section, floor: flatDb.floor } });
        IMChannelPerson.create({ channelId: channel.id, personId: person.id });
        IMMessage.create({ channelId: channel.id, body: { text: `Сосед(ка) из ${flatTxt} вступил(а) в группу` } });
        Cache.getInstance().clear(`imMessages:${channel.id}`);
        // обновляем канал "imChannel"
        responseUpdate.update({
          userId: this.authToken.id,
          createAt: new Date(),
          type: "IM.CHANNEL.UPDATE",
          status: "SUCCESS",
          data: JSON.stringify({ channelId: channel.id, event: "update" })
        });
      } catch (error) {
        console.error(error.message);
      }
      
      // генерируем новость, что у нас новый сосед
      const post = await Post.create({
        title: "Новый сосед",
        type: "person",
        body: `К нам присоединился новый сосед с кв. №${flatDb.number}, этаж ${flatDb.floor}, подъезд ${flatDb.section}`,
        url: `/flat/${flatDb.number}`,
      });
      // отправляем нотификацию всем соседям
      Push.send({ body: post.body, uri: post.url, all: true });
      
      // обновляем канал "posts"
      responseUpdate.update({
        userId: this.authToken.id,
        createAt: new Date(),
        type: "POST.SAVE",
        status: "SUCCESS",
        data: JSON.stringify({ postId: post.id, event: "create" })
      });

      resident = await Resident.findOne({ where: { personId: person.id }, include: [{ model: Flat }] });

      // обновляем канал "invites"
      const inviteDb = await Invite.findOne({ where: { newUserId: this.authToken.id } });
      responseUpdate.update({
        userId: this.authToken.id,
        createAt: new Date(),
        type: "INVITE.SAVE",
        status: "SUCCESS",
        data: JSON.stringify({ inviteId: inviteDb.id, event: "update" })
      });
    }

    Cache.getInstance().clear(`user:${this.authToken.id}`);

    respond(null, { status: "OK", person, resident });
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

function generateCode(len: number) {
  return numeral(parseInt("9".repeat(len)) * Math.random()).format("0".repeat(len));
}

async function newToken(user: User) {
  const role = await Role.findByPk(user.roleId);
  const token = {
    id: user.id,
    mobile: user.mobile,
    banned: user.banned,
    role: { id: role.id, name: role.name },
  };
  console.log(`actions/user.newToken: ${JSON.stringify(token)}`);
  return token;
}