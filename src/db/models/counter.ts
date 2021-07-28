import { model, Schema } from 'mongoose';

export interface ICounter {
    name: string;
    value: number;
    getValue(name: string): number;
}

const CounterSchema = {
    name: { type: String },
    value: { type: Number, default: 0 }
}


export const getCounterModel = (collection = 'payme_counters') => {

    const schema = new Schema<ICounter>(CounterSchema, { collection });

    schema.index(
        {
            name: 1
        },
        {
            name: "name_index",
            unique: true,
            background: true,
        }
    );

    const CounterModel = model<ICounter>('PaymeCounter', schema);

    return CounterModel;
}
