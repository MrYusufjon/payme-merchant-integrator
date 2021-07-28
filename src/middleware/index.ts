import { PaymeErrors } from "../errors";

export async function paymeAuthentication(request, payme_password) {
    try {
        const token = request.headers['authorization'].split('Basic ')[1];
        const password = Buffer.from(token, 'base64').toString('ascii').split(':')[1];
        if (password != payme_password) {
            throw { message: 'Invalid password' }
        }
    } catch (error) {
        throw PaymeErrors.Unauthorization()
    }
}
