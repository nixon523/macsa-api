/**
 * Parsea parámetros opcionales de paginación (?limit=&offset= o ?page=&limit=).
 * Si no se especifica `limit`, retorna `{ limit: null, offset: 0 }` para mantener
 * compatibilidad total con clientes que esperan la lista completa.
 */
export function parsePagination(query = {}, { defaultLimit = null, maxLimit = 500 } = {}) {
  const rawLimit = query.limit ?? defaultLimit;
  if (rawLimit === null || rawLimit === undefined || rawLimit === '') {
    return { limit: null, offset: 0 };
  }

  const parsedLimit = Number.parseInt(rawLimit, 10);
  if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
    return { limit: defaultLimit, offset: 0 };
  }

  const limit = Math.min(parsedLimit, maxLimit);

  if (query.offset !== undefined && query.offset !== null && query.offset !== '') {
    const parsedOffset = Number.parseInt(query.offset, 10);
    return {
      limit,
      offset: Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0,
    };
  }

  const page = Number.parseInt(query.page ?? '1', 10);
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  return {
    limit,
    offset: (safePage - 1) * limit,
  };
}
