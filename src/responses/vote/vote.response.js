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
const cache_1 = require("../../lib/cache");
const models_1 = require("../../models");
const person_type_1 = require("../type/person.type");
const response_1 = require("../response");
class VoteResponse extends response_1.default {
    constructor(model) {
        super(model.id);
        this.title = model.title;
        this.createdAt = model.createdAt.getTime();
        this.multi = model.multi;
        this.anonymous = model.anonymous;
        this.closed = model.closed;
        this.house = model.allHouse;
        this.section = model.section;
        this.floor = model.floor;
        this.persons = model.persons.length;
        this.questions = model.questions.map(question => {
            return {
                id: question.id,
                body: question.body
            };
        });
        this.answers = model.answers.map(answer => {
            if (model.anonymous) {
                return {
                    id: answer.id,
                    question: { id: answer.questionId },
                    person: {
                        id: answer.personId
                    }
                };
            }
            // дальше только для неанонимного голосования
            return {
                id: answer.id,
                question: { id: answer.questionId },
                person: person_type_1.getPerson(answer.person)
            };
        });
    }
    static create(model) {
        return new VoteResponse(model);
    }
    static get(voteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vote = yield models_1.Vote.findByPk(voteId, { include: VoteResponse.include() });
            if (vote == null)
                return null;
            return VoteResponse.create(vote);
        });
    }
    static list(userId, withCache = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (withCache) {
                console.time("vote.response.cache");
                const cacheData = yield cache_1.default.getInstance().get(`votes:${userId}`);
                console.timeEnd("vote.response.cache");
                if (cacheData != null)
                    return JSON.parse(cacheData);
            }
            const person = yield models_1.Person.findOne({ where: { userId } });
            if (person == null)
                return [];
            const houseId = yield response_1.default.getHouseId(userId);
            const list = yield models_1.VotePerson.findAll({
                where: { personId: person.id },
                include: [
                    {
                        model: models_1.Vote,
                        where: { houseId: { [sequelize_1.Op.or]: [houseId, null] } },
                        include: VoteResponse.include(),
                    }
                ]
            });
            if (list == null || list.length == 0)
                return [];
            const result = list.map(item => VoteResponse.create(item.vote));
            if (withCache)
                cache_1.default.getInstance().set(`votes:${userId}`, JSON.stringify(result));
            return result;
        });
    }
    static seed(action, params, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield response_1.default.checkUser(socket.authToken)) {
                return yield VoteResponse.list(socket.authToken.id);
            }
            else {
                return [];
            }
        });
    }
    static include() {
        return [
            {
                model: models_1.VotePerson,
                separate: true,
            },
            {
                model: models_1.VoteQuestion,
                separate: true,
            },
            {
                model: models_1.VoteAnswer,
                separate: true,
                include: [
                    {
                        model: models_1.Person,
                        include: [
                            {
                                model: models_1.Resident,
                                separate: true,
                                include: [{ model: models_1.Flat }]
                            }
                        ]
                    }
                ]
            }
        ];
    }
}
exports.default = VoteResponse;
