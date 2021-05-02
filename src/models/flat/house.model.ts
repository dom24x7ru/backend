import { AllowNull, Column, DataType, HasMany, Model, Table, Unique } from "sequelize-typescript";
import { Document, FAQCategory, Flat, IMChannel, Instruction, Post, RecommendationCategory, Vote } from "..";
import { tDadataInfo } from "../../lib/dadata";

export type tHouseExtra = {
  square: {
    total: number, // общая площадь
    flats: number,  // площадь квартир
    parking: number, // площадь подземной автостоянки
    nonresidential: number, // площадь нежилых помещений
    pantries: number, // площадь кладовых помещений
  }
};

@Table({
  tableName: "houses",
  comment: "Дома, подключенные к сервису"
})
export default class House extends Model<House> {

  @AllowNull(false)
  @Unique
  @Column({
    comment: "Адрес здания в свободной форме"
  })
  address: string;

  @Column({
    type: DataType.JSON,
    comment: "Структурированный формат адреса от сервиса DADATA"
  })
  dadata: tDadataInfo[];

  @Column({
    type: DataType.DOUBLE,
    comment: "Широта"
  })
  lat: number;

  @Column({
    type: DataType.DOUBLE,
    comment: "Долгота"
  })
  lon: number;

  @Column({
    type: DataType.JSON,
    comment: "Любые дополнительные данные"
  })
  extra: tHouseExtra;

  @HasMany(() => Flat)
  flats: Flat[];

  @HasMany(() => Post)
  posts: Post[];

  @HasMany(() => Document)
  documents: Document[];

  @HasMany(() => FAQCategory)
  faqCategories: FAQCategory[];

  @HasMany(() => IMChannel)
  imChannels: IMChannel[];

  @HasMany(() => Instruction)
  instructions: Instruction[];

  @HasMany(() => RecommendationCategory)
  recommendationCategories: RecommendationCategory[];

  @HasMany(() => Vote)
  votes: Vote[];
}