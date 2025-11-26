// backend/src/services/measurementService.js
import MeasurementsDAO from '../data/measurements-dao.js';
import CustomersDAO from '../data/customers-dao.js';
import UsersDAO from '../data/users-dao.js';

class MeasurementService {

  // =====================================================
  // 底层查询（内部使用）
  // =====================================================

  // 获取某客户的全部量体记录
  static getByCustomer(customerId) {
    const customer = CustomersDAO.getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    return MeasurementsDAO.getByCustomer(customerId);
  }

  // 获取某团体成员的全部量体记录
  static getByGroupMember(memberId) {
    const member = CustomersDAO.getGroupMemberById(memberId);
    if (!member) throw new Error('Group member not found');

    return MeasurementsDAO.getByGroupMember(memberId);
  }

  // 根据 id 查询单条记录
  static getById(id) {
    const m = MeasurementsDAO.getById(id);
    if (!m) throw new Error('Measurement not found');
    return m;
  }

  // =====================================================
  // 创建量体记录（必须二选一）
  // =====================================================

  static createMeasurement(adminId, payload) {
    const { customer_id, group_member_id } = payload;

    if (!customer_id && !group_member_id) {
      throw new Error('Either customer_id or group_member_id is required');
    }
    if (customer_id && group_member_id) {
      throw new Error('customer_id and group_member_id cannot both be set');
    }

    if (customer_id) {
      const customer = CustomersDAO.getCustomerById(customer_id);
      if (!customer) throw new Error('Customer not found');
    }

    if (group_member_id) {
      const member = CustomersDAO.getGroupMemberById(group_member_id);
      if (!member) throw new Error('Group member not found');
    }

    const result = MeasurementsDAO.create({
      ...payload,
      measured_by: adminId
    });

    UsersDAO.logAction({
      userId: adminId,
      action: 'measurement_created',
      targetType: 'measurement',
      targetId: result.lastInsertRowid,
      details: payload
    });

    return {
      success: true,
      id: result.lastInsertRowid
    };
  }

  // =====================================================
  // 更新量体记录
  // =====================================================

  static updateMeasurement(adminId, id, fields) {
    const existing = MeasurementsDAO.getById(id);
    if (!existing) throw new Error('Measurement not found');

    MeasurementsDAO.update(id, fields);

    UsersDAO.logAction({
      userId: adminId,
      action: 'measurement_updated',
      targetType: 'measurement',
      targetId: id,
      details: fields
    });

    return { success: true };
  }

  // =====================================================
  // 删除量体记录
  // =====================================================

  static deleteMeasurement(adminId, id) {
    const existing = MeasurementsDAO.getById(id);
    if (!existing) throw new Error('Measurement not found');

    MeasurementsDAO.delete(id);

    UsersDAO.logAction({
      userId: adminId,
      action: 'measurement_deleted',
      targetType: 'measurement',
      targetId: id,
      details: null
    });

    return { success: true };
  }

  // =====================================================
  // 对路由暴露的友好方法名（方案 A）
  // =====================================================

  // /customers/:id/measurements 用
  static getMeasurementsByCustomer(customerId) {
    return this.getByCustomer(customerId);
  }

  // /group-members/:id/measurements 用
  static getMeasurementsByGroupMember(memberId) {
    return this.getByGroupMember(memberId);
  }

  // /measurements/:id 用
  static getMeasurementById(id) {
    return this.getById(id);
  }
}

export default MeasurementService;
