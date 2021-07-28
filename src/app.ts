import { Model } from "mongoose";
import { MainController } from "./controller";
import { connectToDb } from "./db/connectToDb";
import { getCounterModel, ICounter } from "./db/models/counter";
import { getTransactionModel, ITransaction } from "./db/models/transaction";
import { PaymeErrors } from "./errors";
import { paymeAuthentication } from "./middleware"

export enum PaymeIntegratorType {
    CUMULATIVE = 'cumulative',
    ONE_TIME = 'one-time'
}

export type ContructorDetails = {
    type: PaymeIntegratorType,
    db_str: string;
    collection: string;
    password: string;
    isAccountExist(account: any): Promise<boolean>;
    getPayingCost?(account: any): Promise<number>;
    markAsPaid(account: any, amount: number): void;
}

export class PaymeIntegrator {

    TransactionModel: Model<ITransaction>;
    CounterModel: Model<ICounter>;
    constructor(private integratorOptions: ContructorDetails) {
        if (
            this.integratorOptions.type == PaymeIntegratorType.ONE_TIME &&
            !this.integratorOptions.getPayingCost
        ) {
            console.log('getPayingCost is required for one-time type')
            throw { failed: true }
        }
        this.initialize()
    }
    private async initialize() {
        try {
            connectToDb(this.integratorOptions.db_str);
            this.TransactionModel = getTransactionModel(this.integratorOptions.collection, this.integratorOptions.type == PaymeIntegratorType.ONE_TIME);
            this.CounterModel = getCounterModel('payme_counters')
        }
        catch (error) {
            console.error(error)
        }
    }

    public async authenticate(request, reply) {
        try {
            await paymeAuthentication(request, this.integratorOptions.password)
        }
        catch (error) {
            if (error instanceof PaymeErrors) {
                return reply.send(error)
            }
            reply.send(PaymeErrors.InvalidRequest(error.message))
        }
    }

    public async handler(request, reply) {
        try {
            const result = await MainController.handler(request, this.TransactionModel, this.CounterModel, this.integratorOptions);
            return reply.send({ result });
        }
        catch (error) {
            if (error instanceof PaymeErrors) {
                return reply.send(error)
            }
            reply.send(PaymeErrors.InvalidRequest(error.message))
        }
    }
}
