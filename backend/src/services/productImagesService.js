import ProductImagesDAO from '../data/product-images-dao.js';
import ProductsDAO from '../data/products-dao.js';
import auditService from './auditService.js';   // ← 你的项目规范，是 auditService 负责记录日志

class ProductImagesService {

  // =====================================================
  // 获取某产品所有图片
  // =====================================================
  static getImages(productId) {
    const product = ProductsDAO.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return ProductImagesDAO.getByProduct(productId);
  }

  // =====================================================
  // 新增图片
  // =====================================================
  static addImage(adminId, payload) {
    const { product_id, url, sort_order, is_primary } = payload;

    // 1. 产品是否存在
    const product = ProductsDAO.getProductById(product_id);
    if (!product) {
      throw new Error('Product not found');
    }

    // 2. 数据库新增
    const result = ProductImagesDAO.add({
      product_id,
      url,
      sort_order: sort_order ?? 1,
      is_primary: is_primary ?? 0
    });

    // 3. 审计日志
    auditService.log({
      userId: adminId,
      action: 'product_image_added',
      targetType: 'product',
      targetId: product_id,
      details: { url }
    });

    return {
      success: true,
      id: result.lastInsertRowid
    };
  }

  // =====================================================
  // 删除图片
  // =====================================================
  static deleteImage(adminId, imageId) {
    const existing = ProductImagesDAO.getById(imageId);
    if (!existing) {
      throw new Error('Image not found');
    }

    ProductImagesDAO.delete(imageId);

    auditService.log({
      userId: adminId,
      action: 'product_image_deleted',
      targetType: 'product_image',
      targetId: imageId,
      details: null
    });

    return { success: true };
  }

  // =====================================================
  // 设置为主图
  // =====================================================
  static setPrimary(adminId, imageId) {
    const img = ProductImagesDAO.getById(imageId);
    if (!img) {
      throw new Error('Image not found');
    }

    ProductImagesDAO.setPrimary(imageId, img.product_id);

    auditService.log({
      userId: adminId,
      action: 'product_image_set_primary',
      targetType: 'product',
      targetId: img.product_id,
      details: { imageId }
    });

    return { success: true };
  }
}

export default ProductImagesService;
