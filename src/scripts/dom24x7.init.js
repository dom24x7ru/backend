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
        const data = require("./info.json");
        const address = data.house.address;
        let house = yield models_1.House.findOne({ where: { address } });
        if (house == null) {
            house = yield models_1.House.create({ address });
            console.log(`>>> дом по адресу ${address} добавлено`);
        }
        else {
            console.log(`>>> дом по адресу ${address} ранее уже было добавлено`);
        }
        house.dadata = yield dadata_1.default.address(address);
        house.lat = data.house.coord.lat;
        house.lon = data.house.coord.lon;
        yield house.save();
        console.log(`>>> обновлены данные по дому`);
        // загружаем квартиры
        const flatsData = fs.readFileSync(`${__dirname}/flats.csv`, "utf8");
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
            else {
                console.log(`>>> данные по квартире № ${flatItem.number} ранее уже были добавлены`);
            }
        }
        // добавляем "первого пациента"
        const mobile = data.user.mobile;
        const personInfo = data.user.person;
        let user = yield models_1.User.findOne({ where: { mobile } });
        if (user == null) {
            user = yield models_1.User.create({ mobile, roleId: 2 });
            const person = yield models_1.Person.create({ userId: user.id, surname: personInfo.surname, name: personInfo.name, midname: personInfo.midname });
            const flat = yield models_1.Flat.findOne({ where: { houseId: house.id, number: personInfo.flat.number } });
            yield models_1.Resident.create({ personId: person.id, flatId: flat.id });
            yield models_1.Post.create({
                houseId: house.id,
                type: "person",
                title: "Новый сосед",
                body: `К нам присоединился новый сосед с кв. №${flat.number}, этаж ${flat.floor}, подъезд ${flat.section}`,
                url: `/flat/${flat.number}`
            });
            console.log(`>>> первый пациент добавлен`);
        }
        else {
            console.log(`>>> первый пациент ранее уже был добавлен`);
        }
        // === создаем чаты для дома ===
        yield createChannel(house.id, "Общедомовой", true);
        // для формирования чатов секций и этажей сформируюем удобную структуру квартир в доме
        const flatsDB = yield models_1.Flat.findAll({ where: { houseId: house.id } });
        let flats = {};
        for (let flat of flatsDB) {
            if (flats[flat.section] == null)
                flats[flat.section] = {};
            if (flats[flat.section][flat.floor] == null)
                flats[flat.section][flat.floor] = [];
            flats[flat.section][flat.floor].push(flat);
        }
        for (let section in flats) {
            // чат секции
            yield createChannel(house.id, `Секция №${section}`, false, parseInt(section));
            for (let floor in flats[section]) {
                if (flats[section][floor].length > 1) {
                    // чат этажа в секции
                    yield createChannel(house.id, `Этаж ${floor} в секции ${section}`, false, parseInt(section), parseInt(floor));
                }
            }
        }
        // === добавляем категории для рекомендаций ===
        const recommendationCategories = yield models_1.RecommendationCategory.findAll({ where: { houseId: 1 } });
        if (recommendationCategories != null) {
            for (let category of recommendationCategories) {
                const newCategory = yield models_1.RecommendationCategory.findOne({ where: { houseId: house.id, name: category.name } });
                if (newCategory == null) {
                    const data = {
                        houseId: house.id,
                        name: category.name,
                        img: category.img,
                        sort: category.sort
                    };
                    yield models_1.RecommendationCategory.create(data);
                    console.log(`>>> добавили новую категорию "${category.name}"`);
                }
                else {
                    console.log(`>>> категория "${category.name}" ранее уже была добавлена`);
                }
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
function createChannel(houseId, title, allHouse, section = null, floor = null) {
    return __awaiter(this, void 0, void 0, function* () {
        let channel;
        if (allHouse) {
            channel = yield models_1.IMChannel.findOne({ where: { houseId, allHouse } });
        }
        else {
            channel = yield models_1.IMChannel.findOne({ where: { houseId, section, floor: floor } });
        }
        if (channel == null) {
            // новая еще не созданная группа
            console.log(`>>> создаем группу "${title}"`);
            channel = yield models_1.IMChannel.create({ houseId, title, allHouse, section, floor });
            // сразу для него генерируем системное сообщение
            yield models_1.IMMessage.create({ channelId: channel.id, body: { text: `Создана группа "${title}"` } });
        }
        else {
            console.log(`>>> ранее созданная группа группу "${title}"`);
        }
        // теперь подключаем всех необходимых пользователей
        console.log(`    >>> добавляем новах пользователей в группу`);
        let residents = [];
        if (allHouse) {
            // весь дом
            residents = yield models_1.Resident.findAll({ include: [{ model: models_1.Flat, where: { houseId } }] });
        }
        else {
            let flats = [];
            if (floor != null) {
                // группа по этажу
                flats = yield models_1.Flat.findAll({ where: { houseId, section, floor } });
            }
            else {
                // группа по секции
                flats = yield models_1.Flat.findAll({ where: { houseId, section } });
            }
            residents = yield models_1.Resident.findAll({ where: { flatId: flats.map(flat => flat.id) }, include: [{ model: models_1.Flat }] });
        }
        for (let resident of residents) {
            const channelPerson = yield models_1.IMChannelPerson.findOne({ where: { channelId: channel.id, personId: resident.personId } });
            if (channelPerson == null) {
                console.log(`        добавляем пользователя ${resident.personId}`);
                yield models_1.IMChannelPerson.create({ channelId: channel.id, personId: resident.personId });
                const flat = resident.flat;
                const flatTxt = `кв. ${flat.number}, этаж ${flat.floor}, подъезд ${flat.section}`;
                yield models_1.IMMessage.create({ channelId: channel.id, body: { text: `Сосед(ка) из ${flatTxt} вступил(а) в группу` } });
            }
            else {
                console.log(`        ранее добавленный пользователь ${resident.personId}`);
            }
        }
        console.log(`    завершили генерацию группы "${title}"`);
    });
}
