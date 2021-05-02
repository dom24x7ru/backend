import { Op, WhereOptions } from "sequelize";
import { Post } from "../../models";
import Response from "../response";

type tPostFilter = "all" | "pinned" | "unpinned";

export default class PostResponse extends Response {

  createdAt: number;
  type: string;
  title: string;
  body: string;
  url: string;

  constructor(model: Post) {
    super(model.id);
    this.createdAt = model.createdAt.getTime();
    this.type = model.type;
    this.title = model.title;
    this.body = model.body;
    this.url = model.url;
  }

  static create(model: Post) {
    return new PostResponse(model);
  }

  static async get(postId: number) {
    const post = await Post.findByPk(postId);
    if (post == null) return null;
    return PostResponse.create(post);
  }

  static async list(userId: number, filter: tPostFilter = "unpinned") {
    const houseId = await Response.getHouseId(userId);
    const where: WhereOptions = { houseId: { [Op.or]: [houseId, null] }, pin: filter == "pinned" };
    const posts = await Post.findAll({ where, order: [["id", "desc"]] });
    if (posts == null || posts.length == 0) return [];
    return posts.map(post => PostResponse.create(post));
  }

  static async seed(action, params, socket) {
    if (await Response.checkUser(socket.authToken)) {
      if (action == "LIST") return await PostResponse.list(socket.authToken.id);
      if (action == "PINNED") return await PostResponse.list(socket.authToken.id, "pinned");
    } else {
      return [];
    }
  }
}