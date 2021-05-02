import { AllowNull, BelongsTo, Column, Default, ForeignKey, HasMany, Index, Model, Table } from "sequelize-typescript";
import { House, Recommendation } from "..";

@Table({
  tableName: "recommendationCategories",
  comment: "Справочник категорий рекомендаций пользователей"
})
export default class RecommendationCategory extends Model<RecommendationCategory> {

  @Index
  @ForeignKey(() => House)
  @Column
  houseId: number;

  @BelongsTo(() => House)
  house: House;
  
  @AllowNull(false)
  @Column
  name: string;

  @Column
  img: string;

  @Default(0)
  @Column
  sort: number;

  @HasMany(() => Recommendation)
  recommendations: Recommendation[];
}