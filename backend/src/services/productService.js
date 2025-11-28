// backend/src/services/productService.js
import ProductsDAO from '../data/products-dao.js';
import UsersDAO from '../data/users-dao.js';

class ProductService {

    // =====================================================
    // Categories（分类）
    // =====================================================

    static async getAllCategories() { // ✅ Added async
        return await ProductsDAO.getAllCategories(); // ✅ Await DAO call
    }

    static async getCategoryById(id) { // ✅ Added async
        const cat = await ProductsDAO.getCategoryById(id); // ✅ Await DAO call
        if (!cat) throw new Error('Category not found');
        return cat;
    }

    static async createCategory(adminId, data) { // ✅ Added async
        const { code, name } = data;
        if (!code || !name) {
            throw new Error('Missing required fields');
        }

        const result = await ProductsDAO.createCategory(data); // ✅ Await DAO call

        // 如果 DAO 操作没有返回 lastInsertRowid，可能需要检查 result.changes
        if (result.lastInsertRowid === 0) {
            throw new Error('Failed to create category.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'category_created',
            targetType: 'category',
            targetId: result.lastInsertRowid,
            details: data
        });

        return { success: true, id: result.lastInsertRowid };
    }

    static async updateCategory(adminId, id, fields) { // ✅ Added async
        const existing = await ProductsDAO.getCategoryById(id); // ✅ Await DAO call
        if (!existing) throw new Error('Category not found');

        const result = await ProductsDAO.updateCategory(id, fields); // ✅ Await DAO call
        if (result.changes === 0) {
            // 这可能意味着没有字段被更新，或者 ID 不存在（但上面已经检查过）
            // 这里可以根据实际业务逻辑决定是抛出错误还是返回成功
            // 暂时抛出错误，以便调试
            throw new Error('Category update failed or no changes were made.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'category_updated',
            targetType: 'category',
            targetId: id,
            details: fields
        });

        return { success: true };
    }

    static async deleteCategory(adminId, id) { // ✅ Added async
        const result = await ProductsDAO.deleteCategory(id); // ✅ Await DAO call
        if (result.changes === 0) {
            throw new Error('Category not found or could not be deleted.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'category_deleted',
            targetType: 'category',
            targetId: id
        });

        return { success: true, message: `Category ${id} deleted successfully.` };
    }


    // =====================================================
    // Products（布料 + 成衣）
    // =====================================================

    static async getAllProducts() { // ✅ Added async
        return await ProductsDAO.getAllProducts(); // ✅ Await DAO call
    }

    static async getProductById(id) { // ✅ Added async
        const product = await ProductsDAO.getProductById(id); // ✅ Await DAO call
        if (!product) throw new Error('Product not found');
        return product;
    }

    static async search(keyword) { // ✅ Added async
        return await ProductsDAO.searchProducts(keyword); // ✅ Await DAO call
    }

    static async createProduct(adminId, data) { // ✅ Added async
        const { sku, name, category_id, product_type, base_price } = data;

        if (!sku || !name || !category_id || !product_type || base_price == null) {
            throw new Error('Missing required fields');
        }

        const result = await ProductsDAO.createProduct(data); // ✅ Await DAO call
        if (result.lastInsertRowid === 0) {
            throw new Error('Failed to create product.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'product_created',
            targetType: 'product',
            targetId: result.lastInsertRowid,
            details: data
        });

        return { success: true, id: result.lastInsertRowid };
    }

    static async updateProduct(adminId, id, fields) { // ✅ Added async
        const existing = await ProductsDAO.getProductById(id); // ✅ Await DAO call
        if (!existing) throw new Error('Product not found');

        const result = await ProductsDAO.updateProduct(id, fields); // ✅ Await DAO call
        if (result.changes === 0) {
            throw new Error('Product update failed or no changes were made.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'product_updated',
            targetType: 'product',
            targetId: id,
            details: fields
        });

        return { success: true };
    }

    static async deleteProduct(adminId, id) { // ✅ Added async
        const result = await ProductsDAO.deleteProduct(id); // ✅ Await DAO call
        const deletedCount = result.changes; // 获取受影响的行数

        if (deletedCount === 0) {
            throw new Error(`Product with ID ${id} not found or could not be deleted.`);
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'product_deleted',
            targetType: 'product',
            targetId: id
        });

        return { success: true, message: `Product ${id} deleted successfully.` };
    }


    // =====================================================
    // Product Images（产品图片）
    // =====================================================

    static async getImagesByProduct(productId) { // ✅ Added async
        return await ProductsDAO.getImagesByProduct(productId); // ✅ Await DAO call
    }

    static async addImage(adminId, productId, data) { // ✅ Added async
        if (!productId || !data.url) throw new Error('Missing required fields (product_id or url)');

        const result = await ProductsDAO.addImage({ // ✅ Await DAO call
            product_id: productId,
            url: data.url,
            sort_order: data.sort_order ?? 1,
            is_primary: data.is_primary ?? 0
        });

        if (result.lastInsertRowid === 0) {
            throw new Error('Failed to add product image.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'product_image_added',
            targetType: 'product_image',
            targetId: result.lastInsertRowid,
            details: { productId, url: data.url, ...data }
        });

        return { success: true, id: result.lastInsertRowid };
    }

    static async updateImage(adminId, id, fields) { // ✅ Added async
        const result = await ProductsDAO.updateImage(id, fields); // ✅ Await DAO call
        if (result.changes === 0) {
            throw new Error('Image not found or update failed.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'product_image_updated',
            targetType: 'product_image',
            targetId: id,
            details: fields
        });

        return { success: true };
    }

    static async deleteImage(adminId, id) { // ✅ Added async
        const result = await ProductsDAO.deleteImage(id); // ✅ Await DAO call
        if (result.changes === 0) {
            throw new Error('Image not found or could not be deleted.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'product_image_deleted',
            targetType: 'product_image',
            targetId: id
        });

        return { success: true, message: `Image ${id} deleted successfully.` };
    }


    // =====================================================
    // 布料库存：incoming / usage / stock
    // =====================================================

    // ✅ 新增这个方法，用于连接 ProductsDAO.getAllFabricStock
    static async getAllFabricStock() { // ✅ Added async
        return await ProductsDAO.getAllFabricStock(); // ✅ Await DAO call
    }

    static async recordFabricIncoming(adminId, data) { // ✅ Added async
        const { fabric_id, quantity } = data;
        if (!fabric_id || quantity == null) throw new Error('Missing required fields for fabric incoming');

        const result = await ProductsDAO.recordFabricIncoming({ // ✅ Await DAO call
            ...data,
            created_by: adminId, // 补充 created_by
            received_at: data.received_at || new Date().toISOString()
        });

        if (result.lastInsertRowid === 0) {
            throw new Error('Failed to record fabric incoming.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'fabric_incoming_recorded',
            targetType: 'fabric_incoming',
            targetId: result.lastInsertRowid,
            details: data
        });

        return { success: true, id: result.lastInsertRowid };
    }

    static async recordFabricUsage(adminId, data) { // ✅ Added async
        const { fabric_id, used_quantity } = data;
        if (!fabric_id || used_quantity == null) throw new Error('Missing required fields for fabric usage');

        const result = await ProductsDAO.recordFabricUsage({ // ✅ Await DAO call
            ...data,
            operated_by: adminId, // 补充 operated_by
            used_at: data.used_at || new Date().toISOString()
        });

        if (result.lastInsertRowid === 0) {
            throw new Error('Failed to record fabric usage.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'fabric_usage_recorded',
            targetType: 'fabric_usage',
            targetId: result.lastInsertRowid,
            details: data
        });

        return { success: true, id: result.lastInsertRowid };
    }
}

export default ProductService;