// backend/src/services/paymentService.js
import PaymentsDAO from '../data/payment-dao.js';
import RetailOrderDAO from '../data/retail-orders-dao.js';
import UsersDAO from '../data/users-dao.js';

class PaymentService {

  // =====================================================
  // 查询
  // =====================================================
  static getAllPayments() {
    return PaymentsDAO.getAll();
  }

  static getPaymentsByOrder(orderType, orderId) {
    return PaymentsDAO.getByOrder(orderType, orderId);
  }

  static getPaymentById(id) {
    const p = PaymentsDAO.getById(id);
    if (!p) throw new Error('Payment not found');
    return p;
  }

  // =====================================================
  // 创建付款
  // =====================================================
  static createPayment(adminId, payload) {
    const { order_type, order_id, amount } = payload;

    if (!order_type || !order_id) {
      throw new Error('order_type and order_id are required');
    }

    if (amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    // 目前只有零售订单
    if (order_type !== 'retail') {
      throw new Error('Unsupported order_type');
    }

    const order = RetailOrderDAO.getOrderById(order_id);
    if (!order) throw new Error('Order not found');

    // 写入付款记录
    const result = PaymentsDAO.create({
      ...payload,
      received_by: adminId
    });

    // 累计已付款金额
    const payments = PaymentsDAO.getByOrder('retail', order_id);
    const paidTotal = payments.reduce((sum, p) => sum + p.amount, 0);

    // 更新订单状态
    let newStatus = order.status;

    if (paidTotal >= order.total_amount) {
      newStatus = 'completed';
    } else if (paidTotal > 0) {
      newStatus = 'confirmed';
    }

    if (newStatus !== order.status) {
      RetailOrderDAO.updateOrder(order_id, { status: newStatus });
    }

    // 审计日志
    UsersDAO.logAction({
      userId: adminId,
      action: 'payment_created',
      targetType: 'payment',
      targetId: result.lastInsertRowid,
      details: payload
    });

    return {
      success: true,
      id: result.lastInsertRowid,
      new_order_status: newStatus
    };
  }

  // =====================================================
  // 验证银行转账
  // =====================================================
  static verifyTransfer(adminId, paymentId) {
    const p = PaymentsDAO.getById(paymentId);
    if (!p) throw new Error('Payment not found');

    PaymentsDAO.verifyTransfer(paymentId, adminId);

    UsersDAO.logAction({
      userId: adminId,
      action: 'transfer_verified',
      targetType: 'payment',
      targetId: paymentId,
      details: null
    });

    return { success: true };
  }
}

export default PaymentService;
