"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    action: {
        "001": {
            code: "ACTION.001",
            message: "Метод еще в разработке"
        }
    },
    user: {
        "001": {
            code: "USER.001",
            message: "Не совпадает код авторизации"
        },
        "002": {
            code: "USER.002",
            message: "Пользователь заблокирован"
        },
        "003": {
            code: "USER.003",
            message: "Не найден пользователь"
        },
        "004": {
            code: "USER.004",
            message: "Отсутствует валидный токен авторизации"
        }
    },
    params: {
        "001": {
            code: "PARAMS.001",
            message: "Не заданы все обязательные поля"
        },
        "002": {
            code: "PARAMS.002",
            message: "Один из полей не прошел валидацию"
        }
    },
    methods: {
        check: (errors, error) => {
            const parts = error.split(".");
            if (parts.length == 2) {
                const block = parts[0].toLowerCase();
                const code = parts[1];
                const blocks = Object.keys(errors);
                if (blocks.some(item => item == block))
                    return errors[block][code];
            }
            return {
                code: "ERROR.999",
                message: "Неизвестная ошибка"
            };
        }
    }
};
