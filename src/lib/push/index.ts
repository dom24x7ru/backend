import axios, { AxiosRequestConfig } from "axios";
import { Flat, NotificationToken, Person, Resident, User } from "../../models";

export type tPushData = {
  body: string,
  uri: string,
  to?: string,
  all?: boolean,
  houseId?: number
};

export default class Push {

  private static URL = "https://fcm.googleapis.com/fcm/send";
  private static ICON = "/img/logo.png";
  private static APP_URL = "https://yarea40.dom24x7.ru/#";

  public static async send(data: tPushData) {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `key=${process.env.PUSH_KEY}`,
        "Content-Type": "application/json"
      }
    };
    if (data.all) {
      // отправляем всем
      let tokens = [];
      if (data.houseId) {
        const flats = await Flat.findAll({ where: { houseId: data.houseId } });
        const residents = await Resident.findAll({ where: { flatId: flats.map(flat => flat.id) }, include: [{ model: Person, include: [{ model: User }] }] });
        tokens = await NotificationToken.findAll({ where: { userId: residents.map(resident => resident.person.userId) } });
      } else {
        tokens = await NotificationToken.findAll();
      }
      const list = tokens.map(item => item.token);
      const pushData = {
        notification: {
          title: process.env.PUSH_TITLE,
          body: data.body,
          icon: Push.ICON,
          click_action: Push.APP_URL + (data.uri != null ? data.uri : ""),
        },
        registration_ids: list // FIXME: должно быть не более 1000 адресов
      };
      const result = await axios.post(Push.URL, pushData, config);
      return result;
    } else if (data.to) {
      // отправляем конкретному пользователю
      const pushData = {
        notification: {
          title: process.env.PUSH_TITLE,
          body: data.body,
          icon: Push.ICON,
          click_action: Push.APP_URL + (data.uri != null ? data.uri : ""),
        },
        to: data.to
      };
      const result = await axios.post(Push.URL, pushData, config);
      return result;
    }
  }
}