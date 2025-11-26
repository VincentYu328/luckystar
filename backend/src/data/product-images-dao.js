import db from '../database/db.js';

class ProductImagesDAO {

  // =====================================================
  // 获取指定产品的所有图片
  // =====================================================
  static getByProduct(productId) {
    return db.prepare(`
      SELECT *
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC, id ASC
    `).all(productId);
  }

  // =====================================================
  // 获取单张图片（Service 用到）
  // =====================================================
  static getById(id) {
    return db.prepare(`
      SELECT *
      FROM product_images
      WHERE id = ?
    `).get(id);
  }

  // =====================================================
  // 新增图片
  // =====================================================
  static add({ product_id, url, sort_order = 1, is_primary = 0 }) {
    return db.prepare(`
      INSERT INTO product_images (product_id, url, sort_order, is_primary)
      VALUES (?, ?, ?, ?)
    `).run(product_id, url, sort_order, is_primary);
  }

  // =====================================================
  // 删除图片
  // =====================================================
  static delete(id) {
    return db.prepare(`
      DELETE FROM product_images
      WHERE id = ?
    `).run(id);
  }

  // =====================================================
  // 设置主图
  // =====================================================
  static setPrimary(id, product_id) {
    // 1. 清除所有已有主图
    db.prepare(`
      UPDATE product_images
      SET is_primary = 0
      WHERE product_id = ?
    `).run(product_id);

    // 2. 设置新的主图
    return db.prepare(`
      UPDATE product_images
      SET is_primary = 1
      WHERE id = ?
    `).run(id);
  }
}

export default ProductImagesDAO;
