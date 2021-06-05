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
exports.info = void 0;
const models_1 = require("../models");
const person_model_1 = require("../models/person/person.model");
const errors_1 = require("./errors");
function info({ flatNumber }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/flat.info");
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
            const houseId = yield getHouseId(this.authToken.id);
            const flat = yield models_1.Flat.findOne({ where: { houseId, number: flatNumber } });
            if (flat == null)
                throw new Error(errors_1.default.flat["001"].code);
            const residents = yield models_1.Resident.findAll({ where: { flatId: flat.id }, include: [{ model: models_1.Person, include: [{ model: models_1.User }] }] });
            let result = [];
            for (let resident of residents) {
                const person = resident.person;
                if (person.access == null) {
                    person.access = person_model_1.DEFAULT_ACCESS;
                    yield person.save();
                }
                const access = person.access;
                const info = { personId: person.id, surname: null, name: null, midname: null, deleted: person.user.deleted, mobile: null, telegram: null };
                if (access.name.level == "all") {
                    if (access.name.format == "all") {
                        info.surname = person.surname;
                        info.name = person.name;
                        info.midname = person.midname;
                    }
                    else if (access.name.format == "name") {
                        info.name = person.name;
                    }
                }
                if (access.mobile.level == "all") {
                    info.mobile = person.user.mobile;
                }
                if (access.telegram.level == "all") {
                    info.telegram = person.telegram;
                }
                result.push(info);
            }
            respond(null, result);
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.info = info;
function getHouseId(userId) {
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
        return (person != null && person.residents.length != 0) ? person.residents[0].flat.houseId : 1;
    });
}
