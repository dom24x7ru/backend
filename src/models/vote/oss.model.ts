import { BelongsTo, Column, Default, ForeignKey, HasMany, Index, Model, Table } from "sequelize-typescript";
import { House, Person, Vote } from "..";

@Table({
  tableName: "oss",
  comment: "Список общих собраний собственников"
})
export default class Oss extends Model<Oss> {

  @Index
  @ForeignKey(() => House)
  @Column
  houseId: number;

  @BelongsTo(() => House)
  house: House;

  @Index
  @ForeignKey(() => Person)
  @Column
  personId: number;

  @BelongsTo(() => Person)
  person: Person;

  @Column
  start: Date;

  @Column
  end: Date;

  @Default(false)
  @Column
  deleted: boolean;

  @HasMany(() => Vote)
  votes: Vote[];
}