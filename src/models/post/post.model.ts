import { BelongsTo, Column, DataType, Default, ForeignKey, Index, Model, Table } from "sequelize-typescript";
import { House } from "..";

@Table({
  tableName: "posts",
  comment: "Новости"
})
export default class Post extends Model<Post> {

  @Index
  @ForeignKey(() => House)
  @Column
  houseId: number;

  @BelongsTo(() => House)
  house: House;

  @Column({
    comment: "Тип новости"
  })
  type: string;
  
  @Column
  title: string;

  @Column({
    type: DataType.TEXT
  })
  body: string;

  @Column({
    comment: "Ссылка на объект, о которой новость"
  })
  url: string

  @Index
  @Default(false)
  @Column({
    comment: "Признак закрепленной новости"
  })
  pin: boolean
}