export const POINT_AWARDS = {
  reportSubmitted: 50,
  voteCast: 5,
  reportResolved: 100,
};

export const calculateLevel = (points) => Math.max(1, Math.floor(points / 100) + 1);

export const addPoints = async (tx, userId, delta) => {
  const rows = await tx.$queryRaw`
    UPDATE users
    SET
      points = GREATEST(points + ${delta}, 0),
      level = GREATEST(FLOOR(GREATEST(points + ${delta}, 0) / 100.0)::int + 1, 1)
    WHERE id = ${userId}::uuid
    RETURNING id, points, level
  `;

  if (!rows[0]) {
    throw new Error(`user ${userId} not found`);
  }

  return rows[0];
};
