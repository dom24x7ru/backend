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
let House = class House extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column({
        comment: "Адрес здания в свободной форме"
    }),
    __metadata("design:type", String)
], House.prototype, "address", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.JSON,
        comment: "Структурированный формат адреса от сервиса DADATA"
    }),
    __metadata("design:type", Array)
], House.prototype, "dadata", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.DOUBLE,
        comment: "Широта"
    }),
    __metadata("design:type", Number)
], House.prototype, "lat", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.DOUBLE,
        comment: "Долгота"
    }),
    __metadata("design:type", Number)
], House.prototype, "lon", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.JSON,
        comment: "Любые дополнительные данные"
    }),
    __metadata("design:type", Object)
], House.prototype, "extra", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.Flat),
    __metadata("design:type", Array)
], House.prototype, "flats", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.Post),
    __metadata("design:type", Array)
], House.prototype, "posts", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.Document),
    __metadata("design:type", Array)
], House.prototype, "documents", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.FAQCategory),
    __metadata("design:type", Array)
], House.prototype, "faqCategories", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.IMChannel),
    __metadata("design:type", Array)
], House.prototype, "imChannels", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.Instruction),
    __metadata("design:type", Array)
], House.prototype, "instructions", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.RecommendationCategory),
    __metadata("design:type", Array)
], House.prototype, "recommendationCategories", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.Vote),
    __metadata("design:type", Array)
], House.prototype, "votes", void 0);
House = __decorate([
    sequelize_typescript_1.Table({
        tableName: "houses",
        comment: "Дома, подключенные к сервису"
    })
], House);
exports.default = House;
