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
const response_1 = require("../response");
class InviteResponse extends response_1.default {
    constructor(model) {
        super(model.id);
        this.createdAt = model.createdAt.getTime();
        this.code = model.code;
        this.used = model.used;
    }
    static create(model) {
        return __awaiter(this, void 0, void 0, function* () {
            let item = new InviteResponse(model);
            if (item.used) {
                const person = yield models_1.Person.findOne({ where: { userId: model.newUserId } });
                if (person != null) {
                    item.person = { surname: person.surname, name: person.name, midname: person.midname };
                    const resident = yield models_1.Resident.findOne({ where: { personId: person.id }, include: [{ model: models_1.Flat }] });
                    item.flat = { number: resident.flat.number, floor: resident.flat.floor, section: resident.flat.section };
                }
            }
            return item;
        });
    }
    static list(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield models_1.Invite.findAll({
                where: { userId },
                order: [["id", "desc"]],
            });
            if (list == null || list.length == 0)
                return [];
            let result = [];
            for (let item of list) {
                const info = yield InviteResponse.create(item);
                result.push(info);
            }
            return result;
        });
    }
    static seed(action, params, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (socket.authToken == null)
                return [];
            return yield InviteResponse.list(socket.authToken.id);
        });
    }
}
exports.default = InviteResponse;
