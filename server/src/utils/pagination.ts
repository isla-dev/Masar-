export interface PaginationParams {
  page: number;
  limit: number;
}

export function toOffset({ page, limit }: PaginationParams): number {
  return (page - 1) * limit;
}

export function buildMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
