
export class PaymeErrors {
    constructor(public error: any = null) {
    }

    static InvalidAmount(): PaymeErrors {
        return new PaymeErrors({
            code: -31001,
            message: {
                ru: 'неправильное количество',
                en: 'wrong amount',
                uz: 'summa xato kiritilgan'
            }
        })
    }

    static UnablePerform(): PaymeErrors {
        return new PaymeErrors({
            code: -31008,
            message: {
                ru: 'Невозможно выполнить эту операцию',
                en: 'Cannot perform this operation',
                uz: 'Ushbu amalni bajarib bo\'lmaydi'
            }
        })
    }

    static TransactionNotFound(): PaymeErrors {
        return new PaymeErrors({
            code: -31003,
            message: {
                ru: 'Транзакция не найдена',
                en: 'Transaction not found',
                uz: 'Transaksiya topilmadi'
            }
        })
    }

    static OrderIsCompleted(): PaymeErrors {
        return new PaymeErrors({
            code: -31007,
            message: {
                ru: 'Заказ выполнен. Невозможно отменить транзакцию. Товар или услуга предоставляется покупателю в полном объеме',
                en: 'The order is completed. Unable to cancel transaction. The product or service is provided to the buyer in full',
                uz: `Buyurtma bajarildi. Tranzaksiya bekor qilinmadi. Mahsulot yoki xizmat xaridorga to'liq hajmda taqdim etiladi`
            }
        })
    }

    static Unauthorization(): PaymeErrors {
        return new PaymeErrors({
            code: -32504,
            message: {
                ru: 'Недостаточно прав для выполнения метода',
                en: 'There are not enough privileges to execute the method',
                uz: 'Usulni bajarish uchun yetarli imtiyozlar mavjud emas'
            }
        })
    }

    static InvalidRequest(message: string = 'Invalid Request'): PaymeErrors {
        return new PaymeErrors({
            code: -31099,
            message: {
                ru: 'Неверный запрос',
                en: message,
                uz: `So‘rov noto‘g‘ri`
            }
        })
    }

}
