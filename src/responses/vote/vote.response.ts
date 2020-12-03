import { Flat, Person, Resident, Vote, VoteAnswer, VotePerson, VoteQuestion } from "../../models";
import Response from "../response";

type tQuestion = {
  id: number,
  body?: string
};
type tPerson = {
  id: number,
  flat: {
    id: number,
    number: number,
    section: number,
    floor: number
  }
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

  static create(model: Vote) {
    return new VoteResponse(model);
  }

  static async get(voteId: number) {
    const vote = await Vote.findByPk(voteId, { include: VoteResponse.include() });
    if (vote == null) return null;

    return VoteResponse.create(vote);
  }

  static async list(userId: number) {
    const person = await Person.findOne({ where: { userId } });
    if (person == null) return [];

    const list = await VotePerson.findAll({
      where: { personId: person.id },
      include: [
        {
          model: Vote,
          include: VoteResponse.include(),
        }
      ],
      order: [["id", "desc"]]
    });
    if (list == null || list.length == 0) return [];
    return list.map(item => VoteResponse.create(item.vote));
  }

  static async seed(action, params, socket) {
    if (socket.authToken == null) return [];
    return await VoteResponse.list(socket.authToken.id);
  }

  private static include() {
    return [
      { model: VotePerson },
      { model: VoteQuestion },
      {
        model: VoteAnswer,
        include: [
          {
            model: Person,
            include: [
              {
                model: Resident,
                include: [{ model: Flat }]
              }
            ]
          }
        ]
      }
    ];
  }
}