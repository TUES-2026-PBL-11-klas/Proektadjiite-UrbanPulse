import { Prisma } from '@prisma/client';
import {
  CATEGORY_VALUES,
  STATUS_VALUES,
  UUID_PATTERN,
  parseCoordinate,
  parseOptionalDate,
} from '../../routes/reports/helpers.js';
import { ValidationError } from '../../errors/AppError.js';

// Strategy interface: each strategy implements apply(query, conditions)
// and appends Prisma SQL conditions or throws ValidationError.

export class UserIdFilter {
  apply({ user_id: userId }, conditions) {
    if (!userId) return;
    if (!UUID_PATTERN.test(userId)) throw new ValidationError('user_id must be a valid UUID');
    conditions.push(Prisma.sql`r.user_id = ${userId}::uuid`);
  }
}

export class CategoryFilter {
  apply({ category }, conditions) {
    if (!category) return;
    if (!CATEGORY_VALUES.includes(category))
      throw new ValidationError(`category must be one of: ${CATEGORY_VALUES.join(', ')}`);
    conditions.push(Prisma.sql`r.category = ${category}::"Category"`);
  }
}

export class StatusFilter {
  apply({ status }, conditions) {
    if (!status) return;
    if (!STATUS_VALUES.includes(status))
      throw new ValidationError(`status must be one of: ${STATUS_VALUES.join(', ')}`);
    conditions.push(Prisma.sql`r.status = ${status}::"Status"`);
  }
}

export class DateRangeFilter {
  apply({ date_from, date_to }, conditions) {
    const dateFrom = parseOptionalDate(date_from, 'date_from');
    const dateTo = parseOptionalDate(date_to, 'date_to');
    if (dateFrom) conditions.push(Prisma.sql`r.created_at >= ${dateFrom}`);
    if (dateTo) conditions.push(Prisma.sql`r.created_at <= ${dateTo}`);
  }
}

export class BoundingBoxFilter {
  apply({ min_lat, min_lng, max_lat, max_lng }, conditions) {
    const hasSome = [min_lat, min_lng, max_lat, max_lng].some((v) => v !== undefined);
    if (!hasSome) return;
    if ([min_lat, min_lng, max_lat, max_lng].some((v) => v === undefined))
      throw new ValidationError('min_lat, min_lng, max_lat, and max_lng must all be provided');

    const minLat = parseCoordinate(min_lat, 'min_lat', -90, 90);
    const minLng = parseCoordinate(min_lng, 'min_lng', -180, 180);
    const maxLat = parseCoordinate(max_lat, 'max_lat', -90, 90);
    const maxLng = parseCoordinate(max_lng, 'max_lng', -180, 180);

    if (minLat > maxLat || minLng > maxLng)
      throw new ValidationError('bounding box minimums must be less than or equal to maximums');

    conditions.push(
      Prisma.sql`ST_Within(r.location::geometry, ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326))`,
    );
  }
}

// Context: runs all registered strategies in order.
export class ReportFilterContext {
  constructor() {
    this.strategies = [
      new UserIdFilter(),
      new CategoryFilter(),
      new StatusFilter(),
      new DateRangeFilter(),
      new BoundingBoxFilter(),
    ];
  }

  buildConditions(query) {
    const conditions = [];
    for (const strategy of this.strategies) {
      strategy.apply(query, conditions);
    }
    return conditions;
  }
}
