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
const models_1 = require("../models");
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Запуск скрипта переноса инструкций и faq от одного дома к другому");
        const houseIdsource = 1;
        const houseIddesctination = 2;
        const instructions = yield models_1.Instruction.findAll({ where: { houseId: houseIdsource } });
        if (instructions != null) {
            for (let instruction of instructions) {
                yield models_1.Instruction.create({
                    houseId: houseIddesctination,
                    title: instruction.title,
                    subtitle: instruction.subtitle,
                    body: instruction.body
                });
            }
        }
        const faqCategories = yield models_1.FAQCategory.findAll({ where: { houseId: houseIdsource } });
        if (faqCategories != null) {
            for (let faqCategory of faqCategories) {
                const category = yield models_1.FAQCategory.create({ houseId: houseIddesctination, name: faqCategory.name, description: faqCategory.description });
                const faqItems = yield models_1.FAQItem.findAll({ where: { categoryId: faqCategory.id } });
                if (faqItems != null) {
                    for (let faqItem of faqItems) {
                        yield models_1.FAQItem.create({
                            categoryId: category.id,
                            title: faqItem.title,
                            body: faqItem.body
                        });
                    }
                }
            }
        }
        console.log("Завершение скрипта");
    }
    catch (error) {
        console.error(error);
    }
    finally {
        process.exit(0);
    }
}))();
