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
const sequelize_1 = require("sequelize");
const models_1 = require("../../models");
const response_1 = require("../response");
class FAQResponse extends response_1.default {
    constructor(model) {
        super(model.id);
        this.title = model.title;
        this.body = model.body;
        this.category = {
            id: model.category.id,
            name: model.category.name,
            description: model.category.description
        };
    }
    static create(model) {
        return new FAQResponse(model);
    }
    static list(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const houseId = yield response_1.default.getHouseId(userId);
            const list = yield models_1.FAQItem.findAll({ include: [{ model: models_1.FAQCategory, where: { houseId: { [sequelize_1.Op.or]: [houseId, null] } } }], order: [["id", "desc"]] });
            if (list == null || list.length == 0)
                return [];
            return list.map(item => FAQResponse.create(item));
        });
    }
    static seed(action, params, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield response_1.default.checkUser(socket.authToken)) {
                return yield FAQResponse.list(socket.authToken.id);
            }
            else {
                return [];
            }
        });
    }
}
exports.default = FAQResponse;
