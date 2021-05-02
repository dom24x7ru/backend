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
const sequelize_1 = require("sequelize");
class InstructionResponse extends response_1.default {
    constructor(model) {
        super(model.id);
        this.title = model.title;
        this.subtitle = model.subtitle;
        this.body = model.body;
    }
    static create(model) {
        return new InstructionResponse(model);
    }
    static list(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const houseId = yield response_1.default.getHouseId(userId);
            const instructions = yield models_1.Instruction.findAll({ where: { houseId: { [sequelize_1.Op.or]: [houseId, null] } }, order: [["id", "desc"]] });
            if (instructions == null || instructions.length == 0)
                return [];
            return instructions.map(instruction => InstructionResponse.create(instruction));
        });
    }
    static seed(action, params, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield response_1.default.checkUser(socket.authToken)) {
                return yield InstructionResponse.list(socket.authToken.id);
            }
            else {
                return [];
            }
        });
    }
}
exports.default = InstructionResponse;
