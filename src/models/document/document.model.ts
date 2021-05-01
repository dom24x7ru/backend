import { AllowNull, BelongsTo, Column, ForeignKey, Index, Model, Table } from "sequelize-typescript";
import { House } from "..";

@Table({
  tableName: "documents",
  comment: "Список документов"
})
export default class Document extends Model<Document> {

  @Index
  @ForeignKey(() => House)
  @Column
  houseId: number;

  @BelongsTo(() => House)
  house: House;
  
  @AllowNull(false)
  @Column
  title: string;

  @Column
  annotation: string;

  @AllowNull(false)
  @Column
  url: string;
}