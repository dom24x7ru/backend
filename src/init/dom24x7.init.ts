import * as fs from "fs";
import Dadata from "../lib/dadata";
import { Flat, House, IMChannel, IMChannelPerson, IMMessage, Resident } from "../models";

(async () => {
  try {
    console.log("Запуск процесса загрузки данных по дому");
    const address = "Московская обл, г Мытищи, ул Юбилейная, д 10";
    let house = await House.findOne({ where: { address } });
    if (house == null) {
      house = await House.create({ address });
      console.log(`>>> дом по адресу ${address} добавлено`);
    } else {
      console.log(`>>> дом по адресу ${address} ранее уже было добавлено`);
    }

    house.dadata = await Dadata.address(address);
    house.lat = 55.913096;
    house.lon = 37.715246;
    await house.save();
    console.log(`>>> обновлены данные по дому`);

    // загружаем квартиры
    const flatsData: string = fs.readFileSync(`${__dirname}/u10.csv`, "utf8");
    const flatsArr: string[] = flatsData.split("\r\n");
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
      let flat = await Flat.findOne({ where: { number: flatItem.number, houseId: flatItem.houseId } });
      if (flat == null) {
        console.log(`>>> загружаем данные по квартире № ${flatItem.number}`);
        flat = await Flat.create(flatItem);
      } else {
        console.log(`>>> данные по квартире № ${flatItem.number} ранее уже были добавлены`);
      }
    }

    // === создаем чаты для дома ===

    await createChannel(house.id, "Общедомовой", true);

    // для формирования чатов секций и этажей сформируюем удобную структуру квартир в доме
    const flatsDB = await Flat.findAll({ where: { houseId: house.id }});
    let flats: any = {};
    for (let flat of flatsDB) {
      if (flats[flat.section] == null) flats[flat.section] = {};
      if (flats[flat.section][flat.floor] == null) flats[flat.section][flat.floor] = [];
      flats[flat.section][flat.floor].push(flat);
    }

    for (let section in flats) {
      // чат секции
      await createChannel(house.id, `Секция №${section}`, false, parseInt(section));
      for (let floor in flats[section]) {
        if (flats[section][floor].length > 1) {
          // чат этажа в секции
          await createChannel(house.id, `Этаж ${floor} в секции ${section}`, false, parseInt(section), parseInt(floor));
        }
      }
    }

    console.log("Завершение процесса");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
})();

async function createChannel(houseId: number, title: string, allHouse: boolean, section: number = null, floor: number = null) {
  let channel: IMChannel;
  if (allHouse) {
    channel = await IMChannel.findOne({ where: { houseId, allHouse } });
  } else {
    channel = await IMChannel.findOne({ where: { houseId, section, floor: floor } });
  }
  if (channel == null) {
    // новая еще не созданная группа
    console.log(`>>> создаем группу "${title}"`);
    channel = await IMChannel.create({ houseId, title, allHouse, section, floor });
    // сразу для него генерируем системное сообщение
    await IMMessage.create({ channelId: channel.id, body: { text: `Создана группа "${title}"` } });
  } else {
    console.log(`>>> ранее созданная группа группу "${title}"`);
  }

  // теперь подключаем всех необходимых пользователей
  console.log(`    >>> добавляем новах пользователей в группу`);
  let residents: Resident[] = [];
  if (allHouse) {
    // весь дом
    residents = await Resident.findAll({ include: [{ model: Flat, where: { houseId } }]});
  } else {
    let flats: Flat[] = []
    if (floor != null) {
      // группа по этажу
      flats = await Flat.findAll({ where: { houseId, section, floor } });
    } else {
      // группа по секции
      flats = await Flat.findAll({ where: { houseId, section } });
    }
    residents = await Resident.findAll({ where: { flatId: flats.map(flat => flat.id) }, include: [{ model: Flat }] });
  }
  for (let resident of residents) {
    const channelPerson = await IMChannelPerson.findOne({ where: { channelId: channel.id, personId: resident.personId } });
    if (channelPerson == null) {
      console.log(`        добавляем пользователя ${resident.personId}`);
      await IMChannelPerson.create({ channelId: channel.id, personId: resident.personId });
      const flat = resident.flat;
      const flatTxt = `кв. ${flat.number}, этаж ${flat.floor}, подъезд ${flat.section}`;
      await IMMessage.create({ channelId: channel.id, body: { text: `Сосед(ка) из ${flatTxt} вступил(а) в группу` } });
    } else {
      console.log(`        ранее добавленный пользователь ${resident.personId}`);
    }
  }

  console.log(`    завершили генерацию группы "${title}"`);
}
