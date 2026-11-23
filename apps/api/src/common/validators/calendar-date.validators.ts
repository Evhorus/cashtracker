import { applyDecorators } from '@nestjs/common';
import {
  IsISO8601,
  Matches,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

import { ERROR_MESSAGES } from '../constants/error-messages';

const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Strict `YYYY-MM-DD` calendar date (rejects timestamps that Postgres would shift by TZ, and invalid days like Feb 30). */
export function IsCalendarDate(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(CALENDAR_DATE, {
      message: ERROR_MESSAGES.INVALID_DATE_FORMAT,
      ...validationOptions,
    }),
    IsISO8601(
      { strict: true },
      { message: ERROR_MESSAGES.INVALID_DATE_FORMAT, ...validationOptions },
    ),
  );
}

/** Rejects ranges where this `YYYY-MM-DD` field precedes `property` (lexicographical comparison matches chronological order). */
export function IsNotBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isNotBefore',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: {
        message: ERROR_MESSAGES.INVALID_DATE_RANGE,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [startProperty] = args.constraints as [string];
          const start = (args.object as Record<string, unknown>)[startProperty];
          if (typeof value !== 'string' || typeof start !== 'string') {
            return true;
          }
          return value >= start;
        },
      },
    });
  };
}
