import { model, Schema } from 'mongoose';

export interface ITransaction {
    id: string;
    time: number;
    amount: number;
    account: any;
    create_time: number;
    perform_time: number;
    cancel_time: number;
    state: number;
    reason: number;
    transaction: string;
}

const TransactionSchema = {
    id: { type: String },
    time: { type: Number },
    amount: { type: Number },
    account: { type: Object, _id: false },
    create_time: { type: Number },
    perform_time: { type: Number, default: 0 },
    cancel_time: { type: Number, default: 0 },
    state: { type: Number },
    reason: { type: Number, default: null },
    transaction: { type: String },
}

export const getTransactionModel = (collection = 'transactions', account_index = false) => {

    const schema = new Schema<ITransaction>(TransactionSchema, { collection });

    schema.index(
        {
            id: 1
        },
        {
            name: "payme_business_index",
            unique: true,
            background: true,
        }
    );

    if (account_index) {
        schema.index(
            {
                account: 1
            },
            {
                name: "account_index",
                unique: true,
                background: true,
            }
        );
    }
    const TransactionModel = model<ITransaction>('Transaction', schema);

    if (!account_index) {
        TransactionModel.collection.dropIndex('account_index', (error) => { if (error) { console.log(error) } });
    }

    return TransactionModel;
}
