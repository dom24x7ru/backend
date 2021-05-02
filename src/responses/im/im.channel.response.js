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
const models_1 = require("../../models");
const im_message_model_1 = require("../../models/im/im.message.model");
const response_1 = require("../response");
const person_type_1 = require("../type/person.type");
class IMChannelResponse extends response_1.default {
    constructor(model) {
        super(model.id);
        this.title = model.title;
        this.private = model.private;
        this.count = 0;
        const messages = model.messages;
        if (messages != null && messages.length != 0) {
            const notDeletedMessages = messages.filter(msg => !msg.deleted);
            const lastMessage = notDeletedMessages.sort((msg1, msg2) => {
                if (msg1.id > msg2.id)
                    return -1;
                if (msg1.id < msg2.id)
                    return 1;
                return 0;
            })[0];
            this.lastMessage = {
                createdAt: lastMessage.createdAt.getTime(),
                body: lastMessage.body
            };
            if (lastMessage.personId != null)
                this.lastMessage.person = person_type_1.getPerson(lastMessage.person);
            this.count = notDeletedMessages.length;
        }
    }
    static create(model) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = new IMChannelResponse(model);
            if (response.private) {
                // передаем данные об участниках приватного чата
                const channelsPersons = yield models_1.IMChannelPerson.findAll({
                    where: { channelId: model.id },
                    include: [
                        {
                            model: models_1.Person,
                            include: [
                                {
                                    model: models_1.Resident,
                                    include: [{ model: models_1.Flat }]
                                }
                            ]
                        }
                    ]
                });
                response.persons = channelsPersons.map(channelPerson => person_type_1.getPerson(channelPerson.person));
            }
            return response;
        });
    }
    static get(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield models_1.IMChannel.findByPk(channelId, { include: IMChannelResponse.include() });
            if (channel == null)
                return null;
            return IMChannelResponse.create(channel);
        });
    }
    static list(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const person = yield models_1.Person.findOne({ where: { userId } });
            if (person == null)
                return [];
            const channelsPersons = yield models_1.IMChannelPerson.findAll({
                where: { personId: person.id },
                include: [{ model: models_1.IMChannel, include: IMChannelResponse.include() }]
            });
            if (channelsPersons == null || channelsPersons.length == 0)
                return [];
            let list = [];
            for (let item of channelsPersons) {
                const response = yield IMChannelResponse.create(item.channel);
                list.push(response);
            }
            return list.sort((ch1, ch2) => {
                if (ch1.lastMessage == null || ch2.lastMessage == null)
                    return 0;
                if (ch1.lastMessage.createdAt > ch2.lastMessage.createdAt)
                    return 1;
                if (ch1.lastMessage.createdAt < ch2.lastMessage.createdAt)
                    return -1;
                return 0;
            });
        });
    }
    static seed(action, params, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield response_1.default.checkUser(socket.authToken)) {
                return yield IMChannelResponse.list(socket.authToken.id);
            }
            else {
                return [];
            }
        });
    }
    static include() {
        return [
            {
                model: im_message_model_1.default,
                include: [
                    {
                        model: models_1.Person,
                        include: [
                            {
                                model: models_1.Resident,
                                include: [{ model: models_1.Flat }]
                            }
                        ]
                    }
                ]
            }
        ];
    }
}
exports.default = IMChannelResponse;
