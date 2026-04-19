import { ReportRepository, reportRepository as defaultReportRepo } from '../repositories/ReportRepository.js';
import { ReportFilterContext } from './filters/ReportFilterStrategy.js';
import { removeUploadedFile } from '../middleware/uploadMiddleware.js';
import { POINT_AWARDS, addPoints } from '../utils/gamification.js';
import { formatReportRow, parseCoordinate, CATEGORY_VALUES, validateReportId } from '../routes/reports/helpers.js';
import { ValidationError, NotFoundError } from '../errors/AppError.js';
import { reportsCreatedTotal } from '../metrics.js';
import prismaDefault from '../db.js';

const filterContext = new ReportFilterContext();

export class ReportService {
  constructor(reportRepo = defaultReportRepo, prisma = prismaDefault) {
    this.reportRepo = reportRepo;
    this.prisma = prisma;
  }

  async createReport(user, body, file, imageUrl) {
    if (!file) throw new ValidationError('image is required');

    const { category, title, description } = body;

    if (!category || !CATEGORY_VALUES.includes(category)) {
      await removeUploadedFile(file);
      throw new ValidationError(`category must be one of: ${CATEGORY_VALUES.join(', ')}`);
    }

    if (!title?.trim()) {
      await removeUploadedFile(file);
      throw new ValidationError('title is required');
    }

    let latitude, longitude;
    try {
      latitude = parseCoordinate(body.latitude, 'latitude', -90, 90);
      longitude = parseCoordinate(body.longitude, 'longitude', -180, 180);
    } catch (error) {
      await removeUploadedFile(file);
      throw new ValidationError(error.message);
    }

    const trimmedDescription = description?.trim() || null;

    let rows, updatedUser;
    try {
      [rows, updatedUser] = await this.prisma.$transaction(async (tx) => {
        const inserted = await tx.$queryRaw`
          INSERT INTO reports (user_id, category, title, description, location, image_url, updated_at)
          VALUES (
            ${user.id}::uuid,
            ${category}::"Category",
            ${title.trim()},
            ${trimmedDescription},
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${imageUrl},
            NOW()
          )
          RETURNING
            id, user_id, category::text AS category, title, description, image_url,
            status::text AS status, heat_score, vote_count, created_at, updated_at, resolved_at,
            ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude
        `;
        const updUser = await addPoints(tx, user.id, POINT_AWARDS.reportSubmitted);
        return [inserted, updUser];
      });
    } catch (error) {
      await removeUploadedFile(file);
      throw error;
    }

    reportsCreatedTotal.inc({ category });

    return {
      report: {
        ...formatReportRow(rows[0]),
        author: { id: user.id, display_name: user.display_name },
      },
      user: updatedUser,
    };
  }

  async listReports(query) {
    const { limit: limitRaw, offset: offsetRaw } = query;
    const conditions = filterContext.buildConditions(query);
    const limit = Math.min(Math.max(Number.parseInt(limitRaw ?? '50', 10) || 50, 1), 100);
    const offset = Math.max(Number.parseInt(offsetRaw ?? '0', 10) || 0, 0);
    const rows = await this.reportRepo.findMany(conditions, limit, offset);
    return { reports: rows.map(formatReportRow), pagination: { limit, offset, count: rows.length } };
  }

  async getReport(reportId, requestingUserId) {
    if (!validateReportId(reportId)) throw new ValidationError('report id must be a valid UUID');

    const row = await this.reportRepo.findById(reportId);
    if (!row) throw new NotFoundError('report not found');

    const [statusHistory, votedByMe] = await Promise.all([
      this.reportRepo.findStatusHistory(reportId),
      requestingUserId ? this.reportRepo.findVote(requestingUserId, reportId) : Promise.resolve(null),
    ]);

    return {
      report: { ...formatReportRow(row), voted_by_me: !!votedByMe },
      status_history: statusHistory.map((entry) => ({
        id: entry.id,
        report_id: entry.report_id,
        changed_by: entry.changed_by,
        old_status: entry.old_status,
        new_status: entry.new_status,
        comment: entry.comment,
        changed_at: entry.changed_at,
        admin: entry.admin,
      })),
    };
  }
}

export const reportService = new ReportService();
