import { BelongsTo, Column, Default, ForeignKey, Index, Model, Table } from "sequelize-typescript";
import { Flat, Person } from "..";

@Table({
  tableName: "residents",
  comment: "Связка пользователей с квартирами, которые у них в собственности, либо они в них живут"
})
export default class Resident extends Model<Resident> {

  @Index
  @ForeignKey(() => Person)
  @Column
  personId: number;

  @BelongsTo(() => Person)
  person: Person;

  @Index
  @ForeignKey(() => Flat)
  @Column
  flatId: number;

  @BelongsTo(() => Flat)
  flat: Flat;

  @Default(false)
  @Column
  isOwner: boolean;
}