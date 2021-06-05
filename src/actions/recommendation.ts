import { Flat, Person, Recommendation, RecommendationCategory, Resident, User } from "../models";
import ResponseUpdate from "../responses/response.update";
import errors from "./errors";
import * as fs from "fs";

type tFile = {
  base64: string,
  description: string,
  format: string,
  name: string,
  showDetailState: boolean,
  size: number,
  tags: string[]
};

export async function save({ id, categoryId, title, body, extra, files }, respond) {
  console.log(">>>>> actions/recommendation.save");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);

    const person = await Person.findOne({ where: { userId: this.authToken.id } });

    // === валидация данных ===
    // категории
    if (categoryId == null) throw new Error(errors.recommendation["002"].code);
    const category = await RecommendationCategory.findByPk(categoryId);
    if (category == null) throw new Error(errors.recommendation["002"].code);
    // заголовок
    if (title == null || title.trim().length == 0) throw new Error(errors.recommendation["003"].code);
    // описание
    if (body == null || body.trim().length == 0) throw new Error(errors.recommendation["004"].code);
    // === валидация данных ===

    // если необходимо привязываем файлы к рекомендации
    extra.files = [];
    if (files != null && files.length != 0) {
      for (let item of files) {
        const uri = saveFile(item.file, person);
        if (uri != null) extra.files.push(`https://dom24x7-static.ru.yapahost.ru${uri}`);
      }
    }

    let recommendation: Recommendation;
    if (id != null) {
      // редактирование рекомендации
      recommendation = await Recommendation.findOne({ where: { id, personId: person.id } });
      if (recommendation == null) throw new Error(errors.recommendation["001"].code);
      recommendation.categoryId = categoryId;
      recommendation.title = title;
      recommendation.body = body;
      recommendation.extra = extra;
      await recommendation.save();
    } else {
      // сохранение новой рекомендации
      recommendation = await Recommendation.create({
        categoryId,
        personId: person.id,
        title: title.trim(),
        body: body.trim(),
        extra: extra
      });
    }

    // обновляем канал "recommendations"
    const responseUpdate = new ResponseUpdate(this.exchange);
    responseUpdate.update({
      userId: this.authToken.id,
      createAt: new Date(),
      type: "RECOMMENDATION.SAVE",
      status: "SUCCESS",
      data: JSON.stringify({ recommendationId: recommendation.id, event: "create" })
    });

    respond(null, { status: "OK", recommendation: { id: recommendation.id } });
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

export async function categories(params, respond) {
  console.log(">>>>> actions/recommendation.categories");
  try {
    if (!this.authToken) throw new Error(errors.user["004"].code);
    const user = await User.findByPk(this.authToken.id);
    if (user == null) throw new Error(errors.user["003"].code);
    if (user.banned) throw new Error(errors.user["002"].code);
    if (user.deleted) throw new Error(errors.user["003"].code);

    const houseId = await getHouseId(this.authToken.id);
    const categories = await RecommendationCategory.findAll({ where: { houseId }, order: [["sort", "asc"]] });
    respond(null, categories.map(item => {
      return { id: item.id, name: item.name };
    }));
  } catch (error) {
    console.error(error);
    respond(errors.methods.check(errors, error.message));
  }
}

function saveFile(file: tFile, person: Person) {
  try {
    const data = Buffer.from(file.base64, "base64");
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const pathUriFolder = `/upload/${person.id}/${year}/${month}`;
    const pathFileFolder = `${__dirname}/../../..${pathUriFolder}`;
    if (!fs.existsSync(pathFileFolder)) fs.mkdirSync(pathFileFolder, { recursive: true });
    fs.writeFileSync(`${pathFileFolder}/${file.name}`, data);
    return `${pathUriFolder}/${file.name}`;
  } catch (error) {
    console.error(error);
  }
}

async function getHouseId(userId: number): Promise<number> {
  const person = await Person.findOne({
    where: { userId },
    include: [
      {
        model: Resident,
        include: [{ model: Flat }]
      }
    ]
  });
  return (person != null && person.residents.length != 0) ? person.residents[0].flat.houseId : 1;
}