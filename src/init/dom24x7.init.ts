import * as fs from "fs";
import Dadata from "../lib/dadata";
import { Flat, House } from "../models";

(async () => {
  try {
    console.log("Запуск процесса загрузки данных по дому");
    const address = "Московская обл, г Мытищи, ул Юбилейная, д 10";
    let house = await House.findOne({ where: { address } });
    if (house == null) {
      house = await House.create({ address });
    }

    house.dadata = await Dadata.address(address);
    house.lat = 55.913096;
    house.lon = 37.715246;
    await house.save();

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
      }
    }
    
    console.log("Завершение процесса");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
})();