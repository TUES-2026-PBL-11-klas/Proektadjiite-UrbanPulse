import prismaDefault from '../db.js';

export class UserRepository {
  constructor(prisma = prismaDefault) {
    this.prisma = prisma;
  }

  findByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data) {
    return this.prisma.user.create({ data });
  }

  update(id, data) {
    return this.prisma.user.update({ where: { id }, data });
  }

  findAllWithReportCount() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        display_name: true,
        role: true,
        points: true,
        level: true,
        created_at: true,
        _count: { select: { reports: true } },
      },
      orderBy: { points: 'desc' },
    });
  }
}

export const userRepository = new UserRepository();
