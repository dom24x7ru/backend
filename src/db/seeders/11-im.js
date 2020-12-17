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
module.exports = {
    up: (queryInterface, Sequelize) => __awaiter(void 0, void 0, void 0, function* () {
        yield models_1.IMChannel.sync({ force: true });
        yield models_1.IMMessage.sync({ force: true });
        yield models_1.IMChannelPerson.sync({ force: true });
        yield models_1.IMMessageShow.sync({ force: true });
    }),
    down: (queryInterface, Sequelize) => {
        models_1.IMMessageShow.destroy({ where: {} });
        models_1.IMChannelPerson.destroy({ where: {} });
        models_1.IMMessage.destroy({ where: {} });
        models_1.IMChannel.destroy({ where: {} });
    }
};
