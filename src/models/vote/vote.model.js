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
let Vote = class Vote extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Index,
    sequelize_typescript_1.ForeignKey(() => __1.House),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Vote.prototype, "houseId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => __1.House),
    __metadata("design:type", __1.House)
], Vote.prototype, "house", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Vote.prototype, "title", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column({
        comment: "Признак, что можно выбирать сразу несколько вариантов"
    }),
    __metadata("design:type", Boolean)
], Vote.prototype, "multi", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column({
        comment: "Признак, что голосование анонимное"
    }),
    __metadata("design:type", Boolean)
], Vote.prototype, "anonymous", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column({
        comment: "Признак, что голосование закрыто"
    }),
    __metadata("design:type", Boolean)
], Vote.prototype, "closed", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column({
        comment: "Признак, что голосование на весь дом"
    }),
    __metadata("design:type", Boolean)
], Vote.prototype, "allHouse", void 0);
__decorate([
    sequelize_typescript_1.Column({
        comment: "Если указана секция, то голосование на конкретную секция, либо этаж конкретной секции, если еще и этаж указан"
    }),
    __metadata("design:type", Number)
], Vote.prototype, "section", void 0);
__decorate([
    sequelize_typescript_1.Column({
        comment: "Указывается совместно с параметром секции. Если указан, то голосование по конкретному этажу в секции"
    }),
    __metadata("design:type", Number)
], Vote.prototype, "floor", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => __1.User),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Vote.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => __1.User),
    __metadata("design:type", __1.User)
], Vote.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.Index,
    sequelize_typescript_1.ForeignKey(() => __1.Oss),
    sequelize_typescript_1.Column({
        comment: "Привязка вопроса к ОСС"
    }),
    __metadata("design:type", Number)
], Vote.prototype, "ossId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => __1.Oss),
    __metadata("design:type", __1.Oss)
], Vote.prototype, "oss", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.VoteQuestion),
    __metadata("design:type", Array)
], Vote.prototype, "questions", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.VoteAnswer),
    __metadata("design:type", Array)
], Vote.prototype, "answers", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.VotePerson),
    __metadata("design:type", Array)
], Vote.prototype, "persons", void 0);
Vote = __decorate([
    sequelize_typescript_1.Table({
        tableName: "votes",
        comment: "Список голосований"
    })
], Vote);
exports.default = Vote;
