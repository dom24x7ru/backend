import { Column, Default, HasMany, Model, Table } from "sequelize-typescript";
import { VoteAnswer, VotePerson, VoteQuestion } from "..";

@Table({
  tableName: "votes",
  comment: "Список голосований"
})
export default class Vote extends Model<Vote> {

  @Column
  title: string;

  @Default(false)
  @Column({
    comment: "Признак, что можно выбирать сразу несколько вариантов"
  })
  multi: boolean;

  @Default(false)
  @Column({
    comment: "Признак, что голосование анонимное"
  })
  anonymous: boolean;

  @Default(false)
  @Column({
    comment: "Признак, что голосование закрыто"
  })
  closed: boolean;

  @Default(false)
  @Column({
    comment: "Признак, что голосование на весь дом"
  })
  house: boolean;

  @Column({
    comment: "Если указана секция, то голосование на конкретную секция, либо этаж конкретной секции, если еще и этаж указан"
  })
  section: number;

  @Column({
    comment: "Указывается совместно с параметром секции. Если указан, то голосование по конкретному этажу в секции"
  })
  floor: number;

  @HasMany(() => VoteQuestion)
  questions: VoteQuestion[];

  @HasMany(() => VoteAnswer)
  answers: VoteAnswer[];

  @HasMany(() => VotePerson)
  persons: VotePerson[];
}