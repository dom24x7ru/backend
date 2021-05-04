import { Op } from "sequelize";
import { Flat, Person, Recommendation, RecommendationCategory, Resident } from "../../models";
import { tRecommendationExtra } from "../../models/recommendation/recommendation.model";
import Response from "../response";
import { getPerson, tPerson } from "../type/person.type";

export default class RecommendationResponse extends Response {

  title: string;
  body: string;
  extra: tRecommendationExtra;
  category: {
    id: number,
    name: string,
    img: string,
    sort: number
  };
  person: tPerson;

  constructor(model: Recommendation) {
    super(model.id);
    this.title = model.title;
    this.body = model.body;
    this.extra = model.extra;
    this.category = {
      id: model.category.id,
      name: model.category.name,
      img: model.category.img,
      sort: model.category.sort
    };
    this.person = getPerson(model.person);
  }

  static create(model: Recommendation) {
    return new RecommendationResponse(model);
  }

  static async get(userId: number, recommendationId: number) {
    const houseId = await Response.getHouseId(userId);
    const item = await Recommendation.findByPk(recommendationId, { include: RecommendationResponse.include(houseId) })
    if (item == null) return null;
    return RecommendationResponse.create(item);
  }

  static async list(userId: number) {
    const houseId = await Response.getHouseId(userId);
    const list = await Recommendation.findAll({ include: RecommendationResponse.include(houseId) });
    if (list == null || list.length == 0) return [];
    return list.map(item => RecommendationResponse.create(item));
  }

  static async seed(action, params, socket) {
    if (await Response.checkUser(socket.authToken)) {
      return await RecommendationResponse.list(socket.authToken.id);
    } else {
      return [];
    }
  }

  private static include(houseId: number) {
    return [
      {
        model: RecommendationCategory,
        where: { houseId: { [Op.or]: [houseId, null] } }
      },
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
    ];
  }
}