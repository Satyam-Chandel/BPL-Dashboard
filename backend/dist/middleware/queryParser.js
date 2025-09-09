"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationMeta = exports.buildIncludeClause = exports.buildWhereClause = exports.validatePagination = exports.parseQuery = void 0;
const parseQuery = (req, res, next) => {
    const { query } = req;
    req.pagination = {
        page: query.page ? Math.max(1, parseInt(query.page)) : 1,
        limit: query.limit ? Math.min(100, Math.max(1, parseInt(query.limit))) : 10
    };
    req.filters = {};
    const filterFields = ['status', 'priority', 'role', 'department', 'search'];
    filterFields.forEach(field => {
        if (query[field] && typeof query[field] === 'string') {
            req.filters[field] = query[field];
        }
    });
    req.include = [];
    if (query.include && typeof query.include === 'string') {
        req.include = query.include.split(',').map(item => item.trim()).filter(Boolean);
    }
    req.flags = {
        analytics: query.analytics === 'true',
        workload: query.workload === 'true',
        count: query.count === 'true'
    };
    req.parsedQuery = {
        ...req.pagination,
        ...req.filters,
        id: query.id,
        include: req.include.join(','),
        analytics: req.flags.analytics,
        workload: req.flags.workload,
        count: req.flags.count,
        manager: query.manager,
        assignee: query.assignee,
        creator: query.creator,
        unread: query.unread === 'true',
        type: query.type
    };
    next();
};
exports.parseQuery = parseQuery;
const validatePagination = (req, res, next) => {
    const { page, limit } = req.pagination;
    if (page && page < 1) {
        res.status(400).json({
            success: false,
            error: 'Page number must be greater than 0'
        });
        return;
    }
    if (limit && (limit < 1 || limit > 100)) {
        res.status(400).json({
            success: false,
            error: 'Limit must be between 1 and 100'
        });
        return;
    }
    next();
};
exports.validatePagination = validatePagination;
const buildWhereClause = (filters, additionalConditions = {}) => {
    const where = { ...additionalConditions };
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        where.OR = [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
        ];
    }
    if (filters.status) {
        where.status = filters.status.toUpperCase();
    }
    if (filters.priority) {
        where.priority = filters.priority.toUpperCase();
    }
    if (filters.role) {
        where.role = filters.role.toUpperCase();
    }
    if (filters.department) {
        where.department = { contains: filters.department, mode: 'insensitive' };
    }
    return where;
};
exports.buildWhereClause = buildWhereClause;
const buildIncludeClause = (includeArray) => {
    const include = {};
    includeArray.forEach(relation => {
        switch (relation.toLowerCase()) {
            case 'manager':
                include.manager = {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        designation: true
                    }
                };
                break;
            case 'assignments':
                include.assignments = {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        }
                    }
                };
                break;
            case 'milestones':
                include.milestones = true;
                break;
            case 'comments':
                include.comments = {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                };
                break;
            case 'assignee':
                include.assignee = {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                };
                break;
            case 'creator':
                include.creator = {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                };
                break;
            case 'subordinates':
                include.subordinates = {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true
                    }
                };
                break;
            case 'managedprojects':
                include.managedProjects = {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true
                    }
                };
                break;
        }
    });
    return include;
};
exports.buildIncludeClause = buildIncludeClause;
const getPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
    };
};
exports.getPaginationMeta = getPaginationMeta;
//# sourceMappingURL=queryParser.js.map