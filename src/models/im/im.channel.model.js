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
let IMChannel = class IMChannel extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Index,
    sequelize_typescript_1.ForeignKey(() => __1.House),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], IMChannel.prototype, "houseId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => __1.House),
    __metadata("design:type", __1.House)
], IMChannel.prototype, "house", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], IMChannel.prototype, "title", void 0);
__decorate([
    sequelize_typescript_1.Index,
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column({
        comment: "Признак, что канал для всего дома"
    }),
    __metadata("design:type", Boolean)
], IMChannel.prototype, "allHouse", void 0);
__decorate([
    sequelize_typescript_1.Index,
    sequelize_typescript_1.Column({
        comment: "Если указана секция, то канал на конкретную секция, либо этаж конкретной секции, если еще и этаж указан"
    }),
    __metadata("design:type", Number)
], IMChannel.prototype, "section", void 0);
__decorate([
    sequelize_typescript_1.Index,
    sequelize_typescript_1.Column({
        comment: "Указывается совместно с параметром секции. Если указан, то канал по конкретному этажу в секции"
    }),
    __metadata("design:type", Number)
], IMChannel.prototype, "floor", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column({
        comment: "Признак, что это приватный канал для двух пользователей"
    }),
    __metadata("design:type", Boolean)
], IMChannel.prototype, "private", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.IMMessage),
    __metadata("design:type", Array)
], IMChannel.prototype, "messages", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => __1.IMChannelPerson),
    __metadata("design:type", Array)
], IMChannel.prototype, "persons", void 0);
IMChannel = __decorate([
    sequelize_typescript_1.Table({
        tableName: "imChannels",
        comment: "Группы и каналы в чатах"
    })
], IMChannel);
exports.default = IMChannel;
