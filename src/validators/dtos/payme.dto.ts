import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";

export enum PaymeMethods {
    CheckPerformTransaction = 'CheckPerformTransaction',
    CreateTransaction = 'CreateTransaction',
    PerformTransaction = 'PerformTransaction',
    CancelTransaction = 'CancelTransaction',
    CheckTransaction = 'CheckTransaction',
    GetStatement = 'GetStatement'
}

export const paymeGroups = [
    PaymeMethods.CheckPerformTransaction,
    PaymeMethods.CreateTransaction,
    PaymeMethods.PerformTransaction,
    PaymeMethods.CancelTransaction,
    PaymeMethods.CheckPerformTransaction,
    PaymeMethods.GetStatement
]

export class PaymeParamsDto {

    @IsString({
        groups: [
            PaymeMethods.CreateTransaction,
            PaymeMethods.PerformTransaction,
            PaymeMethods.CancelTransaction,
            PaymeMethods.CheckTransaction
        ]
    })
    id: string;

    @IsNumber({}, {
        groups: [
            PaymeMethods.CreateTransaction
        ]
    })
    time: string;

    @IsNumber({}, {
        groups: [
            PaymeMethods.CheckPerformTransaction,
            PaymeMethods.CreateTransaction
        ]
    })
    amount: number;

    @IsNumber({}, {
        groups: [
            PaymeMethods.GetStatement
        ]
    })
    from: number;

    @IsNumber({}, {
        groups: [
            PaymeMethods.GetStatement
        ]
    })
    to: number;

    @IsNumber({}, {
        groups: [
            PaymeMethods.CancelTransaction
        ]
    })
    reason: number;

    @IsObject({
        groups: [
            PaymeMethods.CheckPerformTransaction,
            PaymeMethods.CreateTransaction
        ]
    })
    account: any;
}

export class PaymeBodyDto {

    @IsEnum(PaymeMethods, { groups: paymeGroups })
    method: PaymeMethods;

    @IsNotEmpty({ groups: paymeGroups })
    @IsObject({ groups: paymeGroups })
    params: object;
}