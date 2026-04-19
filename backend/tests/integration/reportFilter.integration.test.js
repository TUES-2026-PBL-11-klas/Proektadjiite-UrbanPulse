// Integration test: exercises ReportFilterContext strategy pipeline directly
// No database or HTTP layer — verifies filter strategies produce correct SQL conditions.
import { describe, it, expect } from 'vitest';
import { ReportFilterContext, CategoryFilter, BoundingBoxFilter } from '../../src/services/filters/ReportFilterStrategy.js';
import { ValidationError } from '../../src/errors/AppError.js';

describe('ReportFilterContext (Strategy pattern)', () => {
  const ctx = new ReportFilterContext();

  it('returns empty conditions for empty query', () => {
    const conditions = ctx.buildConditions({});
    expect(conditions).toHaveLength(0);
  });

  it('builds one condition for a valid category', () => {
    const conditions = ctx.buildConditions({ category: 'illegal_dump' });
    expect(conditions).toHaveLength(1);
  });

  it('builds one condition for a valid status', () => {
    const conditions = ctx.buildConditions({ status: 'submitted' });
    expect(conditions).toHaveLength(1);
  });

  it('builds conditions for multiple filters combined', () => {
    const conditions = ctx.buildConditions({ category: 'illegal_dump', status: 'submitted' });
    expect(conditions).toHaveLength(2);
  });

  it('builds bounding box condition when all four coords given', () => {
    const conditions = ctx.buildConditions({
      min_lat: '40', min_lng: '20', max_lat: '50', max_lng: '30',
    });
    expect(conditions).toHaveLength(1);
  });
});

describe('CategoryFilter strategy', () => {
  const filter = new CategoryFilter();

  it('throws ValidationError for unknown category', () => {
    expect(() => filter.apply({ category: 'unicorns' }, []))
      .toThrow(ValidationError);
  });

  it('does nothing when category is absent', () => {
    const conditions = [];
    filter.apply({}, conditions);
    expect(conditions).toHaveLength(0);
  });
});

describe('BoundingBoxFilter strategy', () => {
  const filter = new BoundingBoxFilter();

  it('throws ValidationError when only some bbox params provided', () => {
    expect(() => filter.apply({ min_lat: '40', min_lng: '20' }, []))
      .toThrow(ValidationError);
  });

  it('throws ValidationError when min_lat > max_lat', () => {
    expect(() =>
      filter.apply({ min_lat: '60', min_lng: '20', max_lat: '40', max_lng: '30' }, []),
    ).toThrow(ValidationError);
  });

  it('does nothing when no bbox params provided', () => {
    const conditions = [];
    filter.apply({}, conditions);
    expect(conditions).toHaveLength(0);
  });
});
