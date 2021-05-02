import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Index, Model, Table } from "sequelize-typescript";
import { House } from "..";

export interface iInstructionItem {
  id: number;
  title: string;
  subtitle: string;
  body: string;
}

@Table({
  tableName: "instructions",
  comment: "Список инструкций"
})
export default class Instruction extends Model<Instruction> {

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
  subtitle: string;

  @Column({
    type: DataType.JSON,
    comment: "json со списком шагов"
  })
  body: iInstructionItem[];
}