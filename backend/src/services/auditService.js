// backend/src/services/auditService.js
import AuditDAO from '../data/audit-dao.js';

class AuditService {

  static getAllLogs() {
    return AuditDAO.getAll();
  }

  static getLogById(id) {
    const log = AuditDAO.getById(id);
    if (!log) throw new Error('Log not found');
    return log;
  }

  static getLogsByUser(userId) {
    return AuditDAO.getByUser(userId);
  }

  static getLogsByAction(action) {
    return AuditDAO.getByAction(action);
  }

  static getLogsByTarget(targetType, targetId) {
    return AuditDAO.getByTarget(targetType, targetId);
  }

}

export default AuditService;
