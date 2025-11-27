// backend/src/services/adminService.js
import db from '../database/db.js';

class AdminService {
  static async getDashboardStats() {
    const todayOrders = db.prepare(`
      SELECT COUNT(*) AS count
      FROM retail_orders
      WHERE DATE(order_date) = DATE('now')
    `).get()?.count ?? 0;

    const pendingOrders = db.prepare(`
      SELECT COUNT(*) AS count
      FROM retail_orders
      WHERE status = 'pending'
    `).get()?.count ?? 0;

    const totalProducts = db.prepare(`
      SELECT COUNT(*) AS count
      FROM products
    `).get()?.count ?? 0;

    const totalInventoryQty = db.prepare(`
      SELECT COALESCE(SUM(quantity_on_hand), 0) AS qty
      FROM stock_levels
    `).get()?.qty ?? 0;

    const todaySales = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM payments
      WHERE DATE(payment_date) = DATE('now')
    `).get()?.total ?? 0;

    return {
      today_orders: todayOrders,
      pending_orders: pendingOrders,
      total_products: totalProducts,
      total_inventory_qty: totalInventoryQty,
      today_sales: todaySales
    };
  }
}

export default AdminService;