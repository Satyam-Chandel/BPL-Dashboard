import { Request, Response, NextFunction } from 'express';
import { QueryParams, PaginationParams, FilterParams } from '../../../shared/types';
declare global {
    namespace Express {
        interface Request {
            pagination: PaginationParams;
            filters: FilterParams;
            include: string[];
            flags: {
                analytics: boolean;
                workload: boolean;
                count: boolean;
            };
            parsedQuery: QueryParams;
        }
    }
}
export declare const parseQuery: (req: Request, res: Response, next: NextFunction) => void;
export declare const validatePagination: (req: Request, res: Response, next: NextFunction) => void;
export declare const buildWhereClause: (filters: FilterParams, additionalConditions?: any) => any;
export declare const buildIncludeClause: (includeArray: string[]) => any;
export declare const getPaginationMeta: (total: number, page: number, limit: number) => {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
};
//# sourceMappingURL=queryParser.d.ts.map