import { BelongsTo, Column, DataType, ForeignKey, HasMany, Index, Model, Table } from "sequelize-typescript";
import { House, Resident } from "..";

@Table({
  tableName: "flats",
  comment: "Список доступных в доме квартир"
})
export default class Flat extends Model<Flat> {

  @Index
  @ForeignKey(() => House)
  @Column
  houseId: number;

  @BelongsTo(() => House)
  house: House;
  
  @Index
  @Column({
    comment: "Номер квартиры"
  })
  number: number;

  @Index
  @Column({
    comment: "Секция / подъезд"
  })
  section: number;

  @Index
  @Column({
    comment: "Этаж"
  })
  floor: number;

  @Column({
    comment: "Количество комнат"
  })
  rooms: number;

  @Column({
    type: DataType.DOUBLE,
    comment: "Площадь квартиры"
  })
  square: number;

  @HasMany(() => Resident)
  residents: Resident[];
}