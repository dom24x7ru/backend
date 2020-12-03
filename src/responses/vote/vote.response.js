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
class VoteResponse extends response_1.default {
    constructor(model) {
        super(model.id);
        this.title = model.title;
        this.createdAt = model.createdAt.getTime();
        this.multi = model.multi;
        this.anonymous = model.anonymous;
        this.closed = model.closed;
        this.house = model.house;
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
            let flat = null;
            if (answer.person.residents.length > 0) {
                const flatInfo = answer.person.residents[0].flat;
                flat = {
                    id: flatInfo.id,
                    number: flatInfo.number,
                    section: flatInfo.section,
                    floor: flatInfo.floor
                };
            }
            return {
                id: answer.id,
                question: { id: answer.questionId },
                person: {
                    id: answer.personId,
                    flat
                }
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
    static list(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const person = yield models_1.Person.findOne({ where: { userId } });
            if (person == null)
                return [];
            const list = yield models_1.VotePerson.findAll({
                where: { personId: person.id },
                include: [
                    {
                        model: models_1.Vote,
                        include: VoteResponse.include(),
                    }
                ],
                order: [["id", "desc"]]
            });
            if (list == null || list.length == 0)
                return [];
            return list.map(item => VoteResponse.create(item.vote));
        });
    }
    static seed(action, params, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (socket.authToken == null)
                return [];
            return yield VoteResponse.list(socket.authToken.id);
        });
    }
    static include() {
        return [
            { model: models_1.VotePerson },
            { model: models_1.VoteQuestion },
            {
                model: models_1.VoteAnswer,
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
exports.default = VoteResponse;
