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
exports.DEFAULT_ACCESS = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const __1 = require("..");
exports.DEFAULT_ACCESS = {
    name: { level: "all", format: "name" },
    mobile: { level: "friends" },
    telegram: { level: "all" },
};
let Person = class Person extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.ForeignKey(() => __1.User),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Person.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => __1.User),
    __metadata("design:type", __1.User)
], Person.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Person.prototype, "surname", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Person.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Person.prototype, "midname", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Person.prototype, "birthday", void 0);
__decorate([
    sequelize_typescript_1.Default("U"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Person.prototype, "sex", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.TEXT
    }),
    __metadata("design:type", String)
], Person.prototype, "biography", void 0);
__decorate([
    sequelize_typescript_1.Column({
        comment: "Аккаунт в Телеграм"
    }),
    __metadata("design:type", String)
], Person.prototype, "telegram", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.JSON,
        comment: "json с настройками безопасности по отображению персональных данных"
    }),
    __metadata("design:type", Object)
], Person.prototype, "access", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.Resident),
    __metadata("design:type", Array)
], Person.prototype, "residents", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.VoteAnswer),
    __metadata("design:type", Array)
], Person.prototype, "answers", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.VotePerson),
    __metadata("design:type", Array)
], Person.prototype, "votes", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.IMMessage),
    __metadata("design:type", Array)
], Person.prototype, "imMessages", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.IMChannelPerson),
    __metadata("design:type", Array)
], Person.prototype, "channels", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.IMMessageShow),
    __metadata("design:type", Array)
], Person.prototype, "shownMessages", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.Recommendation),
    __metadata("design:type", Array)
], Person.prototype, "recommendations", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.Oss),
    __metadata("design:type", Array)
], Person.prototype, "ossList", void 0);
Person = __decorate([
    sequelize_typescript_1.Table({
        tableName: "persons",
        comment: "Профили пользователей"
    })
], Person);
exports.default = Person;
