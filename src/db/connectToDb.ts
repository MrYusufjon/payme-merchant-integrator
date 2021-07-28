
import mongoose from 'mongoose'

export const connectToDb = async (db_str) => {
    try {
        await mongoose.connect(db_str, {
            useFindAndModify: false,
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })
    } catch (error) {
        throw error;
    }
}
