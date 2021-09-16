import { Model } from "mongoose";
import { ContructorDetails, PaymeIntegratorType } from "../app";
import { ICounter } from "../db/models/counter";
import { ITransaction } from "../db/models/transaction";
import { PaymeErrors } from "../errors";
import { PaymeBodyDto, paymeGroups, PaymeMethods, PaymeParamsDto } from "../validators/dtos/payme.dto";
import { validateIt } from "../validators/validate";

export class MainController {

    static params: ContructorDetails;
    static TransactionModel: Model<ITransaction>;
    static CounterModel: Model<ICounter>;
    public static async handler(request, TransactionModel: Model<ITransaction>, CounterModel: Model<ICounter>, params: ContructorDetails) {
        // initialize model
        this.params = params;
        this.TransactionModel = TransactionModel;
        this.CounterModel = CounterModel;

        const body = await validateIt(request.body, PaymeBodyDto, paymeGroups);
        return await this.switchMethod(body);
    }

    private static async switchMethod(body) {
        switch (body.method) {
            case PaymeMethods.CheckPerformTransaction: {
                return await this.CheckPerformTransaction(body.params)
            }
            case PaymeMethods.CreateTransaction: {
                return await this.CreateTransaction(body.params)
            }
            case PaymeMethods.PerformTransaction: {
                return await this.PerformTransaction(body.params)
            }
            case PaymeMethods.CancelTransaction: {
                return await this.CancelTransaction(body.params);
            }
            case PaymeMethods.CheckTransaction: {
                return await this.CheckTransaction(body.params)
            }
            case PaymeMethods.GetStatement: {
                return this.GetStatement()
            }
        }
    }

    private static validatePaymeAmount(amount) {
        amount /= 100;
        if (amount < 1000) {
            throw PaymeErrors.InvalidAmount()
        }
        return amount;
    }

    private static async CheckPerformTransaction(data) {
        const params = await validateIt(data, PaymeParamsDto, [PaymeMethods.CheckPerformTransaction]);
        this.validatePaymeAmount(params.amount);
        const result = await this.params.isAccountExist(params.account);
        if (!result) {
            throw PaymeErrors.InvalidRequest('Account not found')
        }

        if (this.params.type == PaymeIntegratorType.ONE_TIME) {
            const cost = await this.params.getPayingCost(params.account);
            if (cost != params.amount) {
                throw PaymeErrors.InvalidAmount()
            }
        }
        return {
            allow: true
        }
    }

    private static async CreateTransaction(data) {
        const params = await validateIt(data, PaymeParamsDto, [PaymeMethods.CreateTransaction]);
        params.amount = this.validatePaymeAmount(params.amount);

        if (this.params.type == PaymeIntegratorType.ONE_TIME) {
            const cost = await this.params.getPayingCost(params.account);
            if (cost != params.amount) {
                throw PaymeErrors.InvalidAmount()
            }
        }

        let tra = await this.TransactionModel.findOne({ id: params.id });
        if (tra) {
            return {
                create_time: tra.create_time,
                transaction: tra.transaction,
                state: tra.state
            }
        }

        if (this.params.type == PaymeIntegratorType.ONE_TIME) {
            const is_exist = await this.TransactionModel.findOne({ account: params.account });
            if (is_exist) {
                throw PaymeErrors.InvalidRequest('Transaction not found')
            }
        }
        try {
            const { value: transaction } = await this.CounterModel.findOneAndUpdate({ name: 'payme_transactions' }, { $inc: { value: 1 } }, { new: true, upsert: true });

            const tra_params = {
                ...params,
                create_time: data.time,
                state: 1,
                transaction
            }
            const { _id: saved_id } = await new this.TransactionModel(tra_params).save();
            tra = await this.TransactionModel.findById(saved_id);
        } catch (error) {
            if (error.name == 'MongoError' && error.code == 11000) {
                const exist = await this.TransactionModel.findOne({ account: params.account })
                if (!exist) {
                    throw PaymeErrors.InvalidRequest('Exists smth')
                }

                return {
                    create_time: exist.create_time,
                    transaction: exist.transaction,
                    state: exist.state
                }
            }
            throw PaymeErrors.InvalidRequest('Exists')
        }

        return {
            create_time: tra.create_time,
            transaction: tra.transaction,
            state: tra.state
        }

    }

    private static async PerformTransaction(data) {
        const params = await validateIt(data, PaymeParamsDto, [PaymeMethods.PerformTransaction])

        const tra = await this.TransactionModel.findOne({
            id: params.id
        });

        if (!tra) {
            throw PaymeErrors.TransactionNotFound()
        }
        if (tra.state < 0) {
            throw PaymeErrors.UnablePerform()
        }
        if (tra.perform_time) {
            return {
                transaction: tra.transaction,
                perform_time: tra.perform_time,
                state: tra.state
            }
        }
        const time = new Date().getTime()
        // pay here first
        await this.params.markAsPaid(tra.account, tra.amount);
        //
        tra.state = 2;
        tra.perform_time = time;
        await this.TransactionModel.updateOne(
            { _id: tra._id },
            {
                $set: {
                    perform_time: time,
                    state: 2
                }
            }
        );

        return {
            transaction: tra.transaction,
            perform_time: tra.perform_time,
            state: tra.state
        }
    }

    private static async CancelTransaction(data) {
        const params = await validateIt(data, PaymeParamsDto, [PaymeMethods.CancelTransaction])
        const tra = await this.TransactionModel.findOne({ id: params.id });
        if (!tra) {
            throw PaymeErrors.TransactionNotFound()
        }
        const can_cancel = await this.params.canCancel(tra.account)
        if (!can_cancel) {
            throw PaymeErrors.InvalidRequest()
        }
        const cancel_params: any = {}
        if (!tra.cancel_time) {
            const cancel_time = new Date().getTime()
            cancel_params.cancel_time = cancel_time
            tra.cancel_time = cancel_time
        }
        if (!tra.reason) {
            tra.reason = params.reason
            cancel_params.reason = params.reason
        }
        if (tra.state > 0) {
            cancel_params.state = tra.state * (-1);
            tra.state *= (-1);
        }
        await this.TransactionModel.updateOne({ _id: tra._id }, { $set: cancel_params })

        await this.params.markAsCancel(tra.account);

        return {
            transaction: tra.transaction,
            cancel_time: tra.cancel_time,
            state: tra.state
        };
    }

    private static async CheckTransaction(data) {
        const params = await validateIt(data, PaymeParamsDto, [PaymeMethods.CheckTransaction])
        const tra = await this.TransactionModel.findOne({ id: params.id });
        if (!tra) {
            throw PaymeErrors.TransactionNotFound()
        }
        return {
            create_time: tra.create_time,
            perform_time: tra.perform_time,
            cancel_time: tra.cancel_time,
            transaction: tra.transaction,
            state: tra.state,
            reason: tra.reason
        };
    }

    private static GetStatement() {
        return {
            transactions: []
        }
    }

}
