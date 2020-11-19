import { User, Person, Resident, Flat, Invite, Post } from "../models";
import * as numeral from "numeral";
import SMSC from "../lib/smsc";
import errors from "./errors";
import ResponseUpdate from "../responses/response.update";
import { UserResponse } from "../responses";

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
    let code = null;
    let inviteDb = null;
    do {
      code = generateCode(6);
      inviteDb = await Invite.findOne({ where: { code } });

      // обновляем канал "invites"
      const responseUpdate = new ResponseUpdate(this.exchange);
      await responseUpdate.update({
        userId: this.authToken.id,
        createAt: new Date(),
        type: "INVITE.SAVE",
        status: "SUCCESS",
        data: JSON.stringify({ inviteId: inviteDb.id, event: "create" })
      });
    } while (inviteDb != null);
    inviteDb = await Invite.create({ userId: this.authToken.id, code });
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
    let person = await Person.findOne({ where: { userId: this.authToken.id } });
    if (person == null) {
      // только что зарегистрировались и еще нет профиля
      person = await Person.create({ userId: this.authToken.id, surname, name, midname, telegram, access });
      await Resident.create({ personId: person.id, flatId: flat });
      // генерируем новость, что у нас новый сосед
      const flatDb = await Flat.findByPk(flat);
      const post = await Post.create({ title: "Новый сосед", type: "person", body: `К нам присоединился новый сосед с кв. №${flatDb.number}, этаж ${flatDb.floor}, подъезд ${flatDb.section}` });

      // обновляем канал "posts"
      const responseUpdate = new ResponseUpdate(this.exchange);
      await responseUpdate.update({
        userId: this.authToken.id,
        createAt: new Date(),
        type: "POST.SAVE",
        status: "SUCCESS",
        data: JSON.stringify({ postId: post.id, event: "create" })
      });

      // обновляем канал "invites"
      const inviteDb = await Invite.findOne({ where: { newUserId: this.authToken.id } });
      await responseUpdate.update({
        userId: this.authToken.id,
        createAt: new Date(),
        type: "INVITE.SAVE",
        status: "SUCCESS",
        data: JSON.stringify({ inviteId: inviteDb.id, event: "update" })
      });
    } else {
      // обновляем только данные по персоне, изменения по квартире пока игнорируем
      person.surname = surname;
      person.name = name;
      person.midname = midname;
      person.telegram = telegram;
      person.access = access;
      await person.save();
    }
    const resident = await Resident.findOne({ where: { personId: person.id }, include: [{ model: Flat }] });
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
  const token = await UserResponse.info(user.id);
  console.log(`actions/user.newToken: ${JSON.stringify(token)}`);
  return token;
}