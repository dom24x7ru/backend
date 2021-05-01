"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const __1 = require("..");
let FAQCategory = class FAQCategory extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Index,
    sequelize_typescript_1.ForeignKey(() => __1.House),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], FAQCategory.prototype, "houseId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => __1.House),
    __metadata("design:type", __1.House)
], FAQCategory.prototype, "house", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], FAQCategory.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], FAQCategory.prototype, "description", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.FAQItem),
    __metadata("design:type", Array)
], FAQCategory.prototype, "items", void 0);
FAQCategory = __decorate([
    sequelize_typescript_1.Table({
        tableName: "faqCategories",
        comment: "Категории вопросов для FAQ"
    })
], FAQCategory);
exports.default = FAQCategory;
