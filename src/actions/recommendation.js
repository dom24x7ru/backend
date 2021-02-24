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
exports.categories = exports.save = void 0;
const models_1 = require("../models");
const response_update_1 = require("../responses/response.update");
const errors_1 = require("./errors");
const fs = require("fs");
function save({ id, categoryId, title, body, extra, files }, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/recommendation.save");
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
            const person = yield models_1.Person.findOne({ where: { userId: this.authToken.id } });
            // === валидация данных ===
            // категории
            if (categoryId == null)
                throw new Error(errors_1.default.recommendation["002"].code);
            const category = yield models_1.RecommendationCategory.findByPk(categoryId);
            if (category == null)
                throw new Error(errors_1.default.recommendation["002"].code);
            // заголовок
            if (title == null || title.trim().length == 0)
                throw new Error(errors_1.default.recommendation["003"].code);
            // описание
            if (body == null || body.trim().length == 0)
                throw new Error(errors_1.default.recommendation["004"].code);
            // === валидация данных ===
            let recommendation;
            if (id != null) {
                // редактирование рекомендации
                recommendation = yield models_1.Recommendation.findOne({ where: { id, personId: person.id } });
                if (recommendation == null)
                    throw new Error(errors_1.default.recommendation["001"].code);
                recommendation.categoryId = categoryId;
                recommendation.title = title;
                recommendation.body = body;
                recommendation.extra = extra;
                yield recommendation.save();
            }
            else {
                // сохранение новой рекомендации
                recommendation = yield models_1.Recommendation.create({
                    categoryId,
                    personId: person.id,
                    title: title.trim(),
                    body: body.trim(),
                    extra: extra
                });
            }
            // если необходимо привязываем файлы к рекомендации
            if (files != null && files.length != 0) {
                for (let item of files) {
                    saveFile(item.file);
                }
            }
            // обновляем канал "recommendations"
            const responseUpdate = new response_update_1.default(this.exchange);
            responseUpdate.update({
                userId: this.authToken.id,
                createAt: new Date(),
                type: "RECOMMENDATION.SAVE",
                status: "SUCCESS",
                data: JSON.stringify({ recommendationId: recommendation.id, event: "create" })
            });
            respond(null, { status: "OK", recommendation: { id: recommendation.id } });
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.save = save;
function categories(params, respond) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(">>>>> actions/recommendation.categories");
        try {
            const categories = yield models_1.RecommendationCategory.findAll({ order: [["sort", "asc"]] });
            respond(null, categories.map(item => {
                return { id: item.id, name: item.name };
            }));
        }
        catch (error) {
            console.error(error);
            respond(errors_1.default.methods.check(errors_1.default, error.message));
        }
    });
}
exports.categories = categories;
function saveFile(file) {
    try {
        const data = Buffer.from(file.base64, "base64");
        const pathFileName = `${__dirname}/../../../upload/${file.name}`;
        fs.writeFileSync(pathFileName, data);
    }
    catch (error) {
        console.error(error);
    }
}
