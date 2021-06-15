import { BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from "sequelize-typescript";
import { Person, RecommendationCategory } from "..";

export type tRecommendationExtra = {
  phone: string,
  site: string,
  email: string,
  address: string,
  instagram: string,
  telegram: string,
  files: string[]
};

@Table({
  tableName: "recommendations",
  comment: "Рекомендации пользователей"
})
export default class Recommendation extends Model<Recommendation> {

  @ForeignKey(() => RecommendationCategory)
  @Column
  categoryId: number;

  @BelongsTo(() => RecommendationCategory)
  category: RecommendationCategory;

  @ForeignKey(() => Person)
  @Column
  personId: number;

  @BelongsTo(() => Person)
  person: Person;

  @Column
  title: string;

  @Column({
    type: DataType.TEXT
  })
  body: string;

  @Column({
    type: DataType.JSON
  })
  extra: tRecommendationExtra;

  @Default(false)
  @Column
  deleted: boolean;
}