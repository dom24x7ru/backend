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
const fs = require("fs");
const dadata_1 = require("../lib/dadata");
const models_1 = require("../models");
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Запуск процесса загрузки данных по дому");
        const address = "Московская обл, г Мытищи, ул Юбилейная, д 10";
        let house = yield models_1.House.findOne({ where: { address } });
        if (house == null) {
            house = yield models_1.House.create({ address });
        }
        house.dadata = yield dadata_1.default.address(address);
        house.lat = 55.913096;
        house.lon = 37.715246;
        yield house.save();
        // загружаем квартиры
        const flatsData = fs.readFileSync(`${__dirname}/u10.csv`, "utf8");
        const flatsArr = flatsData.split("\r\n");
        for (let i = 1; i < flatsArr.length; i++) {
            const flatLineArr = flatsArr[i].split(";");
            const flatItem = {
                number: flatLineArr[0],
                section: flatLineArr[3],
                floor: flatLineArr[2],
                rooms: flatLineArr[5],
                square: flatLineArr[4].replace(",", "."),
                houseId: house.id
            };
            let flat = yield models_1.Flat.findOne({ where: { number: flatItem.number, houseId: flatItem.houseId } });
            if (flat == null) {
                console.log(`>>> загружаем данные по квартире № ${flatItem.number}`);
                flat = yield models_1.Flat.create(flatItem);
            }
        }
        console.log("Завершение процесса");
    }
    catch (error) {
        console.error(error);
    }
    finally {
        process.exit(0);
    }
}))();
