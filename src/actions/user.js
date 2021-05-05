"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveProfile = exports.invite = exports.logout = exports.auth = void 0;
const models_1 = require("../models");
const numeral = require("numeral");
const smsc_1 = require("../lib/smsc");
const errors_1 = require("./errors");
const response_update_1 = require("../responses/response.update");
const push_1 = require("../lib/push");
const cache_1 = require("../lib/cache");
function auth({ mobile, invite, code }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/user.auth");
        try {
            let user = yield models_1.User.findOne({ where: { mobile } });
            if (user == null) {
                if (invite == null) {
                    throw new Error(errors_1.default.user["003"].code);
                }
                else {
                    // проверяем корректность кода приглашения и, если все хорошо, то регистрируем нового пользователя
                    let inviteDb = yield models_1.Invite.findOne({ where: { code: invite, used: false } });
                    if (inviteDb == null)
                        throw new Error(errors_1.default.invite["001"].code);
                    user = yield models_1.User.create({ mobile, roleId: 2 }); // 2 - USER
                    inviteDb.used = true;
                    inviteDb.newUserId = user.id;
                    yield inviteDb.save();
                }
            }
            else {
                if (invite != null)
                    throw new Error(errors_1.default.invite["002"].code);
            }
            if (user.banned)
                throw new Error(errors_1.default.user["002"].code);
            if (user.deleted)
                throw new Error(errors_1.default.user["003"].code);
            if (code == null) {
                // формируем и отправляем одноразовый код авторизации по смс
                user.smsCode = generateCode(4);
                yield user.save();
                yield smsc_1.default.send([mobile], `Ваш код: ${user.smsCode}`);
                respond(null, { status: "OK" });
            }
            else {
                // проверяем, что код авторизации совпадает с присланным
                if (user.smsCode != code)
                    throw new Error(errors_1.default.user["001"].code);
                // все хорошо
                const token = yield newToken(user);
                this.setAuthToken(token);
                respond(null, token);
            }
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.auth = auth;
function logout(params, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/user.logout");
        try {
            if (!this.authToken)
                throw new Error(errors_1.default.user["004"].code);
            this.deauthenticate();
            respond(null, true);
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.logout = logout;
function invite(params, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/user.invite");
        try {
            if (!this.authToken)
                throw new Error(errors_1.default.user["004"].code);
            const user = yield models_1.User.findByPk(this.authToken.id);
            if (user == null)
                throw new Error(errors_1.default.user["003"].code);
            if (user.banned)
                throw new Error(errors_1.default.user["002"].code);
            if (user.deleted)
                throw new Error(errors_1.default.user["003"].code);
            let code = null;
            let inviteDb = null;
            do {
                code = generateCode(6);
                inviteDb = yield models_1.Invite.findOne({ where: { code } });
            } while (inviteDb != null);
            inviteDb = yield models_1.Invite.create({ userId: this.authToken.id, code });
            // обновляем канал "invites"
            const responseUpdate = new response_update_1.default(this.exchange);
            responseUpdate.update({
                userId: this.authToken.id,
                createAt: new Date(),
                type: "INVITE.SAVE",
                status: "SUCCESS",
                data: JSON.stringify({ inviteId: inviteDb.id, event: "create" })
            });
            respond(null, { id: inviteDb.id, code });
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.invite = invite;
function saveProfile({ surname, name, midname, telegram, flat, access }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/user.saveProfile");
        try {
            if (!this.authToken)
                throw new Error(errors_1.default.user["004"].code);
            const user = yield models_1.User.findByPk(this.authToken.id);
            if (user == null)
                throw new Error(errors_1.default.user["003"].code);
            if (user.banned)
                throw new Error(errors_1.default.user["002"].code);
            if (user.deleted)
                throw new Error(errors_1.default.user["003"].code);
            const flatDb = yield models_1.Flat.findByPk(flat);
            if (flatDb == null)
                throw new Error(errors_1.default.flat["001"].code);
            let person = yield models_1.Person.findOne({ where: { userId: this.authToken.id } });
            if (person == null) {
                // только что зарегистрировались и еще нет профиля
                person = yield models_1.Person.create({ userId: this.authToken.id, surname: surname, name: name, midname: midname, telegram: telegram, access: access });
            }
            else {
                // обновляем только данные по персоне, изменения по квартире пока игнорируем
                person.surname = surname;
                person.name = name;
                person.midname = midname;
                person.telegram = telegram;
                person.access = access;
                yield person.save();
            }
            let resident = yield models_1.Resident.findOne({ where: { personId: person.id }, include: [{ model: models_1.Flat }] });
            if (resident == null) {
                yield models_1.Resident.create({ personId: person.id, flatId: flat });
                // проверяем активные голосования и, при необходимости, добавляем в нужные
                try {
                    const votes = yield models_1.Vote.findAll({ where: { closed: false } });
                    if (votes != null) {
                        for (let vote of votes) {
                            if (vote.allHouse) {
                                // голосование на весь дом
                                const votePerson = yield models_1.VotePerson.findOne({ where: { voteId: vote.id, personId: person.id } });
                                if (votePerson == null) {
                                    models_1.VotePerson.create({ voteId: vote.id, personId: person.id });
                                }
                            }
                            else {
                                // голосование на подъезд, либо этаж
                                if (resident.flat.section == vote.section) {
                                    if (vote.floor != null) {
                                        // голосование на этаж
                                        if (resident.flat.floor == vote.floor) {
                                            const votePerson = yield models_1.VotePerson.findOne({ where: { voteId: vote.id, personId: person.id } });
                                            if (votePerson == null) {
                                                models_1.VotePerson.create({ voteId: vote.id, personId: person.id });
                                            }
                                        }
                                    }
                                    else {
                                        // голосование на подъезд
                                        const votePerson = yield models_1.VotePerson.findOne({ where: { voteId: vote.id, personId: person.id } });
                                        if (votePerson == null) {
                                            models_1.VotePerson.create({ voteId: vote.id, personId: person.id });
                                        }
                                    }
                                }
                            }
                        }
                        cache_1.default.getInstance().clear("votes:*");
                    }
                }
                catch (error) {
                    console.error(error.message);
                }
                const responseUpdate = new response_update_1.default(this.exchange);
                // добавляем пользователя в чаты
                try {
                    const flatDb = yield models_1.Flat.findByPk(flat);
                    const flatTxt = `кв. ${flatDb.number}, этаж ${flatDb.floor}, подъезд ${flatDb.section}`;
                    // в общедомовой
                    let channel = yield models_1.IMChannel.findOne({ where: { allHouse: true } });
                    models_1.IMChannelPerson.create({ channelId: channel.id, personId: person.id });
                    models_1.IMMessage.create({ channelId: channel.id, body: { text: `Сосед(ка) из ${flatTxt} вступил(а) в группу` } });
                    cache_1.default.getInstance().clear(`imMessages:${channel.id}`);
                    // обновляем канал "imChannel"
                    responseUpdate.update({
                        userId: this.authToken.id,
                        createAt: new Date(),
                        type: "IM.CHANNEL.UPDATE",
                        status: "SUCCESS",
                        data: JSON.stringify({ channelId: channel.id, event: "update" })
                    });
                    // в чат секции
                    channel = yield models_1.IMChannel.findOne({ where: { section: flatDb.section, floor: null } });
                    models_1.IMChannelPerson.create({ channelId: channel.id, personId: person.id });
                    models_1.IMMessage.create({ channelId: channel.id, body: { text: `Сосед(ка) из ${flatTxt} вступил(а) в группу` } });
                    cache_1.default.getInstance().clear(`imMessages:${channel.id}`);
                    // обновляем канал "imChannel"
                    responseUpdate.update({
                        userId: this.authToken.id,
                        createAt: new Date(),
                        type: "IM.CHANNEL.UPDATE",
                        status: "SUCCESS",
                        data: JSON.stringify({ channelId: channel.id, event: "update" })
                    });
                    // в чат этажа
                    channel = yield models_1.IMChannel.findOne({ where: { section: flatDb.section, floor: flatDb.floor } });
                    models_1.IMChannelPerson.create({ channelId: channel.id, personId: person.id });
                    models_1.IMMessage.create({ channelId: channel.id, body: { text: `Сосед(ка) из ${flatTxt} вступил(а) в группу` } });
                    cache_1.default.getInstance().clear(`imMessages:${channel.id}`);
                    // обновляем канал "imChannel"
                    responseUpdate.update({
                        userId: this.authToken.id,
                        createAt: new Date(),
                        type: "IM.CHANNEL.UPDATE",
                        status: "SUCCESS",
                        data: JSON.stringify({ channelId: channel.id, event: "update" })
                    });
                }
                catch (error) {
                    console.error(error.message);
                }
                // генерируем новость, что у нас новый сосед
                const post = yield models_1.Post.create({
                    title: "Новый сосед",
                    type: "person",
                    body: `К нам присоединился новый сосед с кв. №${flatDb.number}, этаж ${flatDb.floor}, подъезд ${flatDb.section}`,
                    url: `/flat/${flatDb.number}`,
                });
                // отправляем нотификацию всем соседям
                push_1.default.send({ body: post.body, uri: post.url, all: true });
                // обновляем канал "posts"
                responseUpdate.update({
                    userId: this.authToken.id,
                    createAt: new Date(),
                    type: "POST.SAVE",
                    status: "SUCCESS",
                    data: JSON.stringify({ postId: post.id, event: "create" })
                });
                resident = yield models_1.Resident.findOne({ where: { personId: person.id }, include: [{ model: models_1.Flat }] });
                // обновляем канал "invites"
                const inviteDb = yield models_1.Invite.findOne({ where: { newUserId: this.authToken.id } });
                responseUpdate.update({
                    userId: this.authToken.id,
                    createAt: new Date(),
                    type: "INVITE.SAVE",
                    status: "SUCCESS",
                    data: JSON.stringify({ inviteId: inviteDb.id, event: "update" })
                });
            }
            cache_1.default.getInstance().clear(`user:${this.authToken.id}`);
            respond(null, { status: "OK", person, resident });
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.saveProfile = saveProfile;
function generateCode(len) {
    return numeral(parseInt("9".repeat(len)) * Math.random()).format("0".repeat(len));
}
function newToken(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const role = yield models_1.Role.findByPk(user.roleId);
        const token = {
            id: user.id,
            mobile: user.mobile,
            banned: user.banned,
            role: { id: role.id, name: role.name },
        };
        console.log(`actions/user.newToken: ${JSON.stringify(token)}`);
        return token;
    });
}
