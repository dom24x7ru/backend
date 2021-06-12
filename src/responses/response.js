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
const models_1 = require("../models");
class Response {
    constructor(id, model, message) {
        this.id = id;
        this.model = model;
        this.message = message;
    }
    static checkUser(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (token == null)
                return false;
            const user = yield models_1.User.findByPk(token.id);
            if (user == null || user.banned || user.deleted)
                return false;
            return true;
        });
    }
    static getHouseId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const person = yield models_1.Person.findOne({
                where: { userId },
                include: [
                    {
                        model: models_1.Resident,
                        include: [{ model: models_1.Flat }]
                    }
                ]
            });
            if (person != null && person.residents.length != 0) {
                // уже полностью сформировавшийся пользователь
                return person.residents[0].flat.houseId;
            }
            else {
                // новый пользователь еще без привязки к квартире и дому
                const invite = yield models_1.Invite.findOne({
                    where: { newUserId: userId },
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
                return invite.user.person.residents[0].flat.houseId;
            }
        });
    }
}
exports.default = Response;
