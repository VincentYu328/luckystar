import ProductsDAO from '../data/products-dao.js';
import UsersDAO from '../data/users-dao.js';

class ProductService {

    // =====================================================
    // 1. Categories（分类）
    // =====================================================

    static async getAllCategories() {
        return await ProductsDAO.getAllCategories();
    }

    static async getCategoryById(id) {
        const cat = await ProductsDAO.getCategoryById(id);
        if (!cat) throw new Error('Category not found');
        return cat;
    }

    static async createCategory(adminId, data) {
        const { code, name } = data;
        if (!code || !name) {
            throw new Error('Missing required fields');
        }

        const result = await ProductsDAO.createCategory(data);

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

    static async updateCategory(adminId, id, fields) {
        const existing = await ProductsDAO.getCategoryById(id);
        if (!existing) throw new Error('Category not found');

        const result = await ProductsDAO.updateCategory(id, fields);
        if (result.changes === 0) {
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

    static async deleteCategory(adminId, id) {
        const result = await ProductsDAO.deleteCategory(id);
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
    // 2. Products（布料 + 成衣）
    // =====================================================

    static async getAllProducts() {
        return await ProductsDAO.getAllProducts();
    }

    static async getProductById(id) {
        const product = await ProductsDAO.getProductById(id);
        if (!product) throw new Error('Product not found');
        return product;
    }

    static async search(keyword) {
        return await ProductsDAO.searchProducts(keyword);
    }

    static async createProduct(adminId, data) {
        const { sku, name, category_id, product_type, base_price } = data;

        if (!sku || !name || !category_id || !product_type || base_price == null) {
            throw new Error('Missing required fields');
        }

        const result = await ProductsDAO.createProduct(data);
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

    static async updateProduct(adminId, id, fields) {
        const existing = await ProductsDAO.getProductById(id);
        if (!existing) throw new Error('Product not found');

        const result = await ProductsDAO.updateProduct(id, fields);
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

    static async deleteProduct(adminId, id) {
        const result = await ProductsDAO.deleteProduct(id);
        const deletedCount = result.changes;

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
    // 3. Product Images（产品图片）
    // =====================================================

    static async getImagesByProduct(productId) {
        return await ProductsDAO.getImagesByProduct(productId);
    }

    static async addImage(adminId, productId, data) {
        if (!productId || !data.url) throw new Error('Missing required fields (product_id or url)');

        const result = await ProductsDAO.addImage({
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

    static async updateImage(adminId, id, fields) {
        const result = await ProductsDAO.updateImage(id, fields);
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

    static async deleteImage(adminId, id) {
        const result = await ProductsDAO.deleteImage(id);
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
    // 4. 库存列表访问 (Stock Accessors: Fabric & Garment)
    // =====================================================

    /**
     * @description 获取布料库存列表 (Fabric Stock)
     */
    static async getAllFabricStock() {
        return await ProductsDAO.getAllFabricStock();
    }

    /**
     * @description 获取成衣库存列表 (Garment Stock)
     * ⭐ 修复了路由中 'not a function' 的错误
     */
    static async getAllGarmentStock() {
        return await ProductsDAO.getAllGarmentStock();
    }


    // =====================================================
    // 5. 布料库存操作 (Fabric Inventory Operations)
    // =====================================================

    /**
     * @description 记录布料入库 (Fabric Incoming)
     */
    static async recordFabricIncoming(adminId, data) {
        const { fabric_id, quantity } = data;
        if (!fabric_id || quantity == null) throw new Error('Missing required fields for fabric incoming');

        const result = await ProductsDAO.recordFabricIncoming({
            ...data,
            created_by: adminId,
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

    /**
     * @description 记录布料使用/出库 (Fabric Usage/Out)
     */
    static async recordFabricUsage(adminId, data) {
        const { fabric_id, used_quantity } = data;
        if (!fabric_id || used_quantity == null) throw new Error('Missing required fields for fabric usage');

        const result = await ProductsDAO.recordFabricUsage({
            ...data,
            operated_by: adminId,
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


   // =====================================================
    // 6. 成衣入库 / 销售 / 出库 (Garment Inventory Operations)
    // =====================================================

    /**
     * @description 记录成衣入库 (Garment Incoming)
     */
    static async recordGarmentIncoming(adminId, data) {
        const { garment_id, quantity } = data;
        
        if (!garment_id || quantity == null || quantity <= 0) {
            throw new Error('Missing required fields (garment_id, quantity > 0) for garment incoming');
        }

        // 核心：调用 DAO 层进行数据插入和流水记录
        const result = await ProductsDAO.recordGarmentIncoming({
            ...data,
            garment_id: Number(garment_id),
            quantity: Math.abs(Math.floor(quantity)), // 确保是正整数
            created_by: adminId,
            received_at: data.received_at || new Date().toISOString()
        });

        if (result.garmentIncomingId === 0) { // 假设 DAO 返回 garmentIncomingId 或 lastInsertRowid
            throw new Error('Failed to record garment incoming.');
        }

        // 审计日志 (与 Fabric Incoming 结构保持一致)
        UsersDAO.logAction({
            userId: adminId,
            action: 'garment_incoming_recorded',
            targetType: 'garment_incoming',
            targetId: result.garmentIncomingId, // 使用实际插入的 ID
            details: data
        });

        return { success: true, id: result.garmentIncomingId };
    }


    /**
     * 记录成衣销售/出库 —— 完全模仿 recordFabricUsage 的写法
     */
    static async recordGarmentSale(adminId, data) {
        console.log('[ProductService] recordGarmentSale 收到数据:', data);

        // 前端传 garmentId 或 garment_id，都兼容
        const garment_id = data.garmentId ?? data.garment_id;
        const quantity = data.quantity ?? data.qty;

        if (!garment_id || quantity == null || quantity <= 0) {
            throw new Error('Missing required fields (garment_id, quantity > 0) for garment sale.');
        }

        // 调用 ProductsDAO 里【已经写好的】专用方法
        const result = await ProductsDAO.recordGarmentSale({
            garment_id: Number(garment_id),
            quantity: Math.abs(Math.floor(quantity)),
            operated_by: adminId,
            sold_at: data.sold_at || new Date().toISOString(),
            sale_type: data.saleType ?? data.sale_type ?? 'retail_sale',
            reference: data.reference || data.ref || null,
            notes: data.remark || data.notes || null
        });

        if (result.lastInsertRowid === 0) {
            throw new Error('Failed to record garment sale.');
        }

        // 审计日志
        await UsersDAO.logAction({
            userId: adminId,
            action: 'garment_sale_recorded',
            targetType: 'garment_sale',
            targetId: result.lastInsertRowid,
            details: {
                garment_id,
                quantity,
                reference: data.reference || data.notes
            }
        });

        return {
            success: true,
            id: result.lastInsertRowid,
            message: `成功销售出库 ${quantity} 件`
        };
    }

    // =====================================================
    // 7. 唯一库存项（Unique Items / Barcode Tracking）
    // =====================================================

    /**
     * @description 创建一个新的唯一库存项（例如：在生产或采购时）
     */
    static async createUniqueItem(adminId, data) {
        const { product_id, unique_code } = data;
        if (!product_id || !unique_code) {
            throw new Error('Missing required fields: product_id and unique_code');
        }

        // 验证 unique_code 是否已存在
        const existing = await ProductsDAO.getUniqueItemByCode(unique_code);
        if (existing) {
            throw new Error(`Unique code ${unique_code} already exists for item ID ${existing.id}`);
        }

        const result = await ProductsDAO.createUniqueItem(data);
        if (result.lastInsertRowid === 0) {
            throw new Error('Failed to create unique inventory item.');
        }

        UsersDAO.logAction({
            userId: adminId,
            action: 'unique_item_created',
            targetType: 'inventory_item',
            targetId: result.lastInsertRowid,
            details: data
        });

        return { success: true, id: result.lastInsertRowid };
    }

    /**
     * @description 通过条码查找商品，主要用于销售和库存盘点。
     */
    static async getUniqueItemDetails(uniqueCode) {
        const item = await ProductsDAO.getUniqueItemByCode(uniqueCode);
        if (!item) {
            throw new Error(`Item with unique code ${uniqueCode} not found.`);
        }

        // 最佳实践：这里应该 JOIN products 表以获取 SKU 和名称
        const product = await ProductsDAO.getProductById(item.product_id);

        return {
            ...item,
            product_sku: product.sku,
            product_name: product.name
        };
    }
}

export default ProductService;