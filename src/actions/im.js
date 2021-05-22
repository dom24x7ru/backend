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
exports.createPrivateChannel = exports.setMute = exports.getMute = exports.load = exports.del = exports.shown = exports.save = void 0;
const cache_1 = require("../lib/cache");
const push_1 = require("../lib/push");
const models_1 = require("../models");
const responses_1 = require("../responses");
const response_update_1 = require("../responses/response.update");
const errors_1 = require("./errors");
function save({ messageId, channelId, body }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/im.save");
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
            const person = yield models_1.Person.findOne({ where: { userId: this.authToken.id } });
            const channelPerson = yield models_1.IMChannelPerson.findOne({ where: { channelId, personId: person.id } });
            if (channelPerson == null)
                throw new Error(errors_1.default.im["001"].code);
            let message = null;
            if (messageId == null) {
                // создаем новое сообщение
                message = yield models_1.IMMessage.create({ personId: person.id, channelId, body });
                yield models_1.IMMessageShow.create({ personId: person.id, messageId: message.id });
                // отправляем нотификации всем, подписанным на группу
                const channel = yield models_1.IMChannel.findByPk(channelId);
                const persons = yield models_1.IMChannelPerson.findAll({ where: { channelId, mute: false }, include: [{ model: models_1.Person }] });
                const userIds = persons.map(item => item.person.userId);
                const tokens = yield models_1.NotificationToken.findAll({ where: { userId: userIds } });
                if (tokens != null) {
                    for (let item of tokens) {
                        // не отправлять пользователю, который создал сообщение
                        if (item.userId != this.authToken.id) {
                            push_1.default.send({ body: `Новое сообщение в чате "${channel.title}"`, uri: `/im/${channelId}`, to: item.token });
                        }
                    }
                }
            }
            else {
                // редактируем сообщение
                message = yield models_1.IMMessage.findOne({ where: { id: messageId, personId: person.id } });
                if (message == null)
                    throw new Error(errors_1.default.im["002"].code);
                message.body = body;
                yield message.save();
            }
            cache_1.default.getInstance().clear(`imMessages:${channelId}`);
            // обновляем канал с группами чатов и конкретную группу
            const responseUpdate = new response_update_1.default(this.exchange);
            responseUpdate.update({
                userId: this.authToken.id,
                createAt: new Date(),
                type: "IM.SAVE",
                status: "SUCCESS",
                data: JSON.stringify({ channelId, messageId: message.id, event: "create" })
            });
            respond(null, { status: "OK" });
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.save = save;
function shown({ messageId }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/im.shown");
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
            const person = yield models_1.Person.findOne({ where: { userId: this.authToken.id } });
            const message = yield models_1.IMMessage.findByPk(messageId);
            if (message == null)
                throw new Error(errors_1.default.im["002"].code);
            yield models_1.IMMessageShow.create({ personId: person.id, messageId });
            // обновляем канал с группами чатов и конкретную группу
            const responseUpdate = new response_update_1.default(this.exchange);
            yield responseUpdate.update({
                userId: this.authToken.id,
                createAt: new Date(),
                type: "IM.SHOWN",
                status: "SUCCESS",
                data: JSON.stringify({ channelId: message.channelId, messageId, event: "create" })
            });
            respond(null, { status: "OK" });
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.shown = shown;
function del({ messageId }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/im.del");
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
            const person = yield models_1.Person.findOne({ where: { userId: this.authToken.id } });
            const message = yield models_1.IMMessage.findOne({ where: { id: messageId, personId: person.id } });
            if (message == null)
                throw new Error(errors_1.default.im["002"].code);
            message.deleted = true;
            yield message.save();
            cache_1.default.getInstance().clear(`imMessages:${message.channelId}`);
            // обновляем канал с группами чатов и конкретную группу
            const responseUpdate = new response_update_1.default(this.exchange);
            yield responseUpdate.update({
                userId: this.authToken.id,
                createAt: new Date(),
                type: "IM.MSG.DEL",
                status: "SUCCESS",
                data: JSON.stringify({ channelId: message.channelId, messageId, event: "destroy" })
            });
            respond(null, { status: "OK" });
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.del = del;
function load({ channelId, limit, offset }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/im.load");
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
            const person = yield models_1.Person.findOne({ where: { userId: this.authToken.id } });
            const channelPerson = yield models_1.IMChannelPerson.findOne({ where: { channelId, personId: person.id } });
            if (channelPerson == null)
                throw new Error(errors_1.default.im["001"].code);
            const messages = yield responses_1.IMMessageResponse.list(channelId, this.authToken.id, limit, offset, false);
            respond(null, messages);
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.load = load;
function getMute({ channelId }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/im.getMute");
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
            const person = yield models_1.Person.findOne({ where: { userId: this.authToken.id } });
            const channelPerson = yield models_1.IMChannelPerson.findOne({ where: { channelId, personId: person.id } });
            if (channelPerson == null)
                throw new Error(errors_1.default.im["001"].code);
            respond(null, { mute: channelPerson.mute });
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.getMute = getMute;
function setMute({ channelId, mute }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/im.setMute");
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
            const person = yield models_1.Person.findOne({ where: { userId: this.authToken.id } });
            const channelPerson = yield models_1.IMChannelPerson.findOne({ where: { channelId, personId: person.id } });
            if (channelPerson == null)
                throw new Error(errors_1.default.im["001"].code);
            channelPerson.mute = mute;
            channelPerson.save();
            respond(null, { mute: channelPerson.mute });
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.setMute = setMute;
function createPrivateChannel({ personId }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/im.createPrivateChannel");
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
            const person = yield models_1.Person.findOne({ where: { userId: this.authToken.id } });
            if (person.id == personId)
                throw new Error(errors_1.default.im["003"].code);
            // в начале нужно проверить, что уже имеется приватный канал, а не сразу создавать его
            const getPrivateChannel = (personIds) => __awaiter(this, void 0, void 0, function* () {
                const channels = yield models_1.IMChannel.findAll({ where: { private: true }, include: [{ model: models_1.IMChannelPerson }] });
                for (let channel of channels) {
                    if (channel.persons.length == personIds.length) {
                        // количество участников совпадает, и нужно проверить, что участники именно те, что нужно
                        let status = true;
                        for (let channelPerson of channel.persons) {
                            if (personIds.indexOf(channelPerson.personId) == -1)
                                status = false;
                        }
                        if (status)
                            return channel;
                    }
                }
                return null;
            });
            let channel = yield getPrivateChannel([person.id, personId]);
            if (channel == null) {
                const resident = yield models_1.Resident.findOne({ where: { personId: person.id }, include: [{ model: models_1.Flat }] });
                channel = yield models_1.IMChannel.create({ houseId: resident.flat.houseId, private: true });
                models_1.IMChannelPerson.create({ channelId: channel.id, personId: person.id });
                models_1.IMChannelPerson.create({ channelId: channel.id, personId });
                // обновляем канал "imChannel"
                const responseUpdate = new response_update_1.default(this.exchange);
                responseUpdate.update({
                    userId: this.authToken.id,
                    createAt: new Date(),
                    type: "IM.CHANNEL.UPDATE",
                    status: "SUCCESS",
                    data: JSON.stringify({ channelId: channel.id, event: "create" })
                });
            }
            respond(null, { status: "OK", channelId: channel.id });
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.createPrivateChannel = createPrivateChannel;
