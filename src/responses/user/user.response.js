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
const response_1 = require("../response");
const models_1 = require("../../models");
const person_model_1 = require("../../models/person/person.model");
const cache_1 = require("../../lib/cache");
class UserResponse extends response_1.default {
    constructor(model) {
        super(model.id);
        this.mobile = model.mobile;
        this.banned = model.banned;
    }
    static create(model) {
        return __awaiter(this, void 0, void 0, function* () {
            let token = new UserResponse(model);
            const person = yield models_1.Person.findOne({ where: { userId: model.id } });
            const role = yield models_1.Role.findByPk(model.roleId);
            let resident = null;
            if (person != null)
                resident = yield models_1.Resident.findOne({ where: { personId: person.id }, include: [{ model: models_1.Flat }] });
            if (person != null && person.access == null) {
                // устанавливаем права по-умолчанию
                person.access = person_model_1.DEFAULT_ACCESS;
                yield person.save();
            }
            token.role = { id: role.id, name: role.name };
            token.person = person;
            token.resident = resident;
            if (token.resident != null) {
                // уже полностью сформированная учетная запись с привязкой к квартире
                token.houseId = token.resident.flat.houseId;
            }
            else {
                // новый пользователь, нужно взять данные у пригласившего пользователя
                const invite = yield models_1.Invite.findOne({
                    where: { newUserId: token.id },
                    include: [
                        {
                            model: models_1.User,
                            as: "user",
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
                    ]
                });
                token.houseId = invite.user.person.residents[0].flat.houseId;
            }
            return token;
        });
    }
    static info(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheData = yield cache_1.default.getInstance().get(`user:${userId}`);
            if (cacheData != null)
                return JSON.parse(cacheData);
            const user = yield models_1.User.findByPk(userId);
            if (user == null)
                return null;
            const token = yield UserResponse.create(user);
            cache_1.default.getInstance().set(`user:${userId}`, JSON.stringify(token));
            return token;
        });
    }
    static seed(action, params, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (socket.authToken == null)
                return null;
            const user = yield models_1.User.findByPk(socket.authToken.id);
            if (user == null || user.banned || user.deleted)
                return null;
            return yield UserResponse.info(socket.authToken.id);
        });
    }
}
exports.default = UserResponse;
