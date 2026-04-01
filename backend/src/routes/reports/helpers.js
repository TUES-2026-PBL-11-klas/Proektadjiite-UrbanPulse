import { Category, Prisma, Status } from '@prisma/client';

export const CATEGORY_VALUES = Object.values(Category);
export const STATUS_VALUES = Object.values(Status);
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const REPORT_SELECT = Prisma.sql`
  SELECT
    r.id,
    r.user_id,
    r.category::text AS category,
    r.title,
    r.description,
    r.image_url,
    r.status::text AS status,
    r.heat_score,
    r.vote_count,
    r.created_at,
    r.updated_at,
    r.resolved_at,
    ST_Y(r.location::geometry) AS latitude,
    ST_X(r.location::geometry) AS longitude,
    u.display_name AS author_display_name
  FROM reports r
  INNER JOIN users u ON u.id = r.user_id
`;

export const parseCoordinate = (value, fieldName, min, max) => {
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${fieldName} must be a number between ${min} and ${max}`);
  }

  return parsed;
};

export const parseOptionalDate = (value, fieldName) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }

  return parsed;
};

export const formatReportRow = (row) => ({
  id: row.id,
  user_id: row.user_id,
  category: row.category,
  title: row.title,
  description: row.description,
  image_url: row.image_url,
  status: row.status,
  vote_count: row.vote_count,
  created_at: row.created_at,
  updated_at: row.updated_at,
  resolved_at: row.resolved_at,
  heat_score: Number(row.heat_score),
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  author: {
    id: row.user_id,
    display_name: row.author_display_name,
  },
});

export const validateReportId = (reportId) => UUID_PATTERN.test(reportId);
