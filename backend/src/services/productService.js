// backend/src/services/productService.js
import ProductsDAO from '../data/products-dao.js';
import UsersDAO from '../data/users-dao.js';

class ProductService {

  // =====================================================
  // Categories（分类）
  // =====================================================

  static getAllCategories() {
    return ProductsDAO.getAllCategories();
  }

  static getCategoryById(id) {
    const cat = ProductsDAO.getCategoryById(id);
    if (!cat) throw new Error('Category not found');
    return cat;
  }

  static createCategory(adminId, data) {
    const { code, name } = data;
    if (!code || !name) {
      throw new Error('Missing required fields');
    }

    const result = ProductsDAO.createCategory(data);

    UsersDAO.logAction({
      userId: adminId,
      action: 'category_created',
      targetType: 'category',
      targetId: result.lastInsertRowid,
      details: data
    });

    return { success: true, id: result.lastInsertRowid };
  }

  static updateCategory(adminId, id, fields) {
    const existing = ProductsDAO.getCategoryById(id);
    if (!existing) throw new Error('Category not found');

    ProductsDAO.updateCategory(id, fields);

    UsersDAO.logAction({
      userId: adminId,
      action: 'category_updated',
      targetType: 'category',
      targetId: id,
      details: fields
    });

    return { success: true };
  }

  static deleteCategory(adminId, id) {
    ProductsDAO.deleteCategory(id);

    UsersDAO.logAction({
      userId: adminId,
      action: 'category_deleted',
      targetType: 'category',
      targetId: id
    });

    return { success: true };
  }


  // =====================================================
  // Products（布料 + 成衣）
  // =====================================================

  static getAllProducts() {
    return ProductsDAO.getAllProducts();
  }

  static getProductById(id) {
    const product = ProductsDAO.getProductById(id);
    if (!product) throw new Error('Product not found');
    return product;
  }

  static search(keyword) {
    return ProductsDAO.searchProducts(keyword);
  }

  static createProduct(adminId, data) {
    const { sku, name, category_id, product_type, base_price } = data;

    if (!sku || !name || !category_id || !product_type || base_price == null) {
      throw new Error('Missing required fields');
    }

    const result = ProductsDAO.createProduct(data);

    UsersDAO.logAction({
      userId: adminId,
      action: 'product_created',
      targetType: 'product',
      targetId: result.lastInsertRowid,
      details: data
    });

    return { success: true, id: result.lastInsertRowid };
  }

  static updateProduct(adminId, id, fields) {
    const existing = ProductsDAO.getProductById(id);
    if (!existing) throw new Error('Product not found');

    ProductsDAO.updateProduct(id, fields);

    UsersDAO.logAction({
      userId: adminId,
      action: 'product_updated',
      targetType: 'product',
      targetId: id,
      details: fields
    });

    return { success: true };
  }

  static deleteProduct(adminId, id) {
    ProductsDAO.deleteProduct(id);

    UsersDAO.logAction({
      userId: adminId,
      action: 'product_deleted',
      targetType: 'product',
      targetId: id
    });

    return { success: true };
  }


  // =====================================================
  // Product Images（产品图片）
  // =====================================================

  static getImagesByProduct(productId) {
    return ProductsDAO.getImagesByProduct(productId);
  }

  static addImage(adminId, productId, url, extra = {}) {
    if (!productId || !url) throw new Error('Missing required fields');

    const result = ProductsDAO.addImage({
      product_id: productId,
      url,
      sort_order: extra.sort_order ?? 1,
      is_primary: extra.is_primary ?? 0
    });

    UsersDAO.logAction({
      userId: adminId,
      action: 'product_image_added',
      targetType: 'product_image',
      targetId: result.lastInsertRowid,
      details: { productId, url, ...extra }
    });

    return { success: true, id: result.lastInsertRowid };
  }

  static updateImage(adminId, id, fields) {
    const existing = ProductsDAO.updateImage(id, fields);
    if (!existing) throw new Error('Image update failed');

    UsersDAO.logAction({
      userId: adminId,
      action: 'product_image_updated',
      targetType: 'product_image',
      targetId: id,
      details: fields
    });

    return { success: true };
  }

  static deleteImage(adminId, id) {
    ProductsDAO.deleteImage(id);

    UsersDAO.logAction({
      userId: adminId,
      action: 'product_image_deleted',
      targetType: 'product_image',
      targetId: id
    });

    return { success: true };
  }
}

export default ProductService;
