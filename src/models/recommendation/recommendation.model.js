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
let Recommendation = class Recommendation extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => __1.RecommendationCategory),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Recommendation.prototype, "categoryId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => __1.RecommendationCategory),
    __metadata("design:type", __1.RecommendationCategory)
], Recommendation.prototype, "category", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => __1.Person),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Recommendation.prototype, "personId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => __1.Person),
    __metadata("design:type", __1.Person)
], Recommendation.prototype, "person", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Recommendation.prototype, "title", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.TEXT
    }),
    __metadata("design:type", String)
], Recommendation.prototype, "body", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.JSON
    }),
    __metadata("design:type", Object)
], Recommendation.prototype, "extra", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Recommendation.prototype, "deleted", void 0);
Recommendation = __decorate([
    sequelize_typescript_1.Table({
        tableName: "recommendations",
        comment: "Рекомендации пользователей"
    })
], Recommendation);
exports.default = Recommendation;
