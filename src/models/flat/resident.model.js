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
let Resident = class Resident extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Index,
    sequelize_typescript_1.ForeignKey(() => __1.Person),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Resident.prototype, "personId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => __1.Person),
    __metadata("design:type", __1.Person)
], Resident.prototype, "person", void 0);
__decorate([
    sequelize_typescript_1.Index,
    sequelize_typescript_1.ForeignKey(() => __1.Flat),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Resident.prototype, "flatId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => __1.Flat),
    __metadata("design:type", __1.Flat)
], Resident.prototype, "flat", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Resident.prototype, "isOwner", void 0);
Resident = __decorate([
    sequelize_typescript_1.Table({
        tableName: "residents",
        comment: "Связка пользователей с квартирами, которые у них в собственности, либо они в них живут"
    })
], Resident);
exports.default = Resident;
