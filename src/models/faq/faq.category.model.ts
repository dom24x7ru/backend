import { BelongsTo, Column, ForeignKey, HasMany, Index, Model, Table } from "sequelize-typescript";
import { FAQItem, House } from "..";

@Table({
  tableName: "faqCategories",
  comment: "Категории вопросов для FAQ"
})
export default class FAQCategory extends Model<FAQCategory> {

  @Index
  @ForeignKey(() => House)
  @Column
  houseId: number;

  @BelongsTo(() => House)
  house: House;
  
  @Column
  name: string;

  @Column
  description: string;

  @HasMany(() => FAQItem)
  items: FAQItem[];
}