import { Op } from "sequelize";
import Cache from "../../lib/cache";
import { Flat, Person, Resident, Vote, VoteAnswer, VotePerson, VoteQuestion } from "../../models";
import { getPerson, tPerson } from "../type/person.type";
import Response from "../response";

type tQuestion = {
  id: number,
  body?: string
};
type tAnswer = {
  id: number,
  question: tQuestion,
  person: tPerson
};

export default class VoteResponse extends Response {

  title: string;
  createdAt: number;
  multi: boolean;
  anonymous: boolean;
  closed: boolean;
  house: boolean;
  section: number;
  floor: number;
  questions: tQuestion[];
  answers: tAnswer[];
  persons: number;

  constructor(model: Vote) {
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
        }
      }
      // дальше только для неанонимного голосования
      return {
        id: answer.id,
        question: { id: answer.questionId },
        person: getPerson(answer.person)
      };
    });
  }

  static create(model: Vote) {
    return new VoteResponse(model);
  }

  static async get(voteId: number) {
    const vote = await Vote.findByPk(voteId, { include: VoteResponse.include() });
    if (vote == null) return null;

    return VoteResponse.create(vote);
  }

  static async list(userId: number, withCache: boolean = true) {
    if (withCache) {
      console.time("vote.response.cache");
      const cacheData = await Cache.getInstance().get(`votes:${userId}`);
      console.timeEnd("vote.response.cache");
      if (cacheData != null) return JSON.parse(cacheData);
    }

    const person = await Person.findOne({ where: { userId } });
    if (person == null) return [];

    const houseId = await Response.getHouseId(userId);
    const list = await VotePerson.findAll({
      where: { personId: person.id },
      include: [
        {
          model: Vote,
          where: { houseId: { [Op.or]: [houseId, null] } },
          include: VoteResponse.include(),
        }
      ]
    });
    if (list == null || list.length == 0) return [];
    const result = list.map(item => VoteResponse.create(item.vote));
    if (withCache) Cache.getInstance().set(`votes:${userId}`, JSON.stringify(result));
    return result;
  }

  static async seed(action, params, socket) {
    if (await Response.checkUser(socket.authToken)) {
      return await VoteResponse.list(socket.authToken.id);
    } else {
      return [];
    }
  }

  private static include() {
    return [
      {
        model: VotePerson,
        separate: true,
      },
      {
        model: VoteQuestion,
        separate: true,
      },
      {
        model: VoteAnswer,
        separate: true,
        include: [
          {
            model: Person,
            include: [
              {
                model: Resident,
                separate: true,
                include: [{ model: Flat }]
              }
            ]
          }
        ]
      }
    ];
  }
}