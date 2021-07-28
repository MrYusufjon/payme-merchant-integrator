
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { PaymeErrors } from '../errors';

export declare type ClassType<T> = {
    new(...args: any[]): T;
};

export const firstError = (errors: ValidationError[]) => {

    for (const error of errors) {

        if (error.contexts) {
            return Object.values(error.contexts).shift();
        }

        if (error.constraints) {
            return Object.values(error.constraints).shift();
        }

        if (error.children.length) {
            return firstError(error.children);
        }
    }

    return null;
};

export const validateIt = async <T>(data, classType: ClassType<T>, groups?) => {

    if (!data) {
        throw PaymeErrors.InvalidRequest('Body should be object')
    }
    const classData = plainToClass(classType, data as T, { excludeExtraneousValues: false });
    const errors = await validate(classData as unknown as Record<string, unknown>, { groups, whitelist: true });

    if (!errors || errors.length === 0) {
        return classData;
    }

    throw PaymeErrors.InvalidRequest('Validation error')
};
