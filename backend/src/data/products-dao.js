import db from '../database/db.js';

class ProductsDAO {

    // =====================================================
    // 1. product_categories（分类）
    // =====================================================

    static async getAllCategories() {
        try {
            return db.prepare(`
                SELECT *
                FROM product_categories
                ORDER BY sort_order ASC, id ASC
            `).all();
        } catch (error) {
            console.error('[DAO ERROR] getAllCategories:', error.message, error.stack);
            throw new Error('Failed to execute category list query against database.');
        }
    }

    static async getCategoryById(id) {
        try {
            return db.prepare(`
                SELECT *
                FROM product_categories
                WHERE id = ?
            `).get(id);
        } catch (error) {
            console.error('[DAO ERROR] getCategoryById:', error.message, error.stack);
            throw error;
        }
    }

    static async getCategoryByCode(code) {
        try {
            return db.prepare(`
                SELECT *
                FROM product_categories
                WHERE code = ?
            `).get(code);
        } catch (error) {
            console.error('[DAO ERROR] getCategoryByCode:', error.message, error.stack);
            throw error;
        }
    }

    static async createCategory(data) {
        try {
            return db.prepare(`
                INSERT INTO product_categories (
                    code, name, parent_id, sort_order, is_active
                ) VALUES (?, ?, ?, ?, ?)
            `).run(
                data.code,
                data.name,
                data.parent_id || null,
                data.sort_order ?? 100,
                data.is_active ?? 1
            );
        } catch (error) {
            console.error('[DAO ERROR] createCategory:', error.message, error.stack);
            throw error;
        }
    }

    static async updateCategory(id, fields) {
        try {
            const allowed = ['code', 'name', 'parent_id', 'sort_order', 'is_active'];
            const keys = Object.keys(fields).filter(k => allowed.includes(k));

            if (!keys.length) {
                return { changes: 0, lastInsertRowid: 0 };
            }

            const clause = keys.map(k => `${k} = ?`).join(', ');
            const params = keys.map(k => fields[k]);
            params.push(id);

            return db.prepare(`
                UPDATE product_categories
                SET ${clause}
                WHERE id = ?
            `).run(...params);
        } catch (error) {
            console.error('[DAO ERROR] updateCategory:', error.message, error.stack);
            throw error;
        }
    }

    static async deleteCategory(id) {
        try {
            return db.prepare(`
                DELETE FROM product_categories WHERE id = ?
            `).run(id);
        } catch (error) {
            console.error('[DAO ERROR] deleteCategory:', error.message, error.stack);
            throw error;
        }
    }


    // =====================================================
    // 2. products（布料 + 成衣）
    // =====================================================

    static async getAllProducts() {
        try {
            return db.prepare(`
                SELECT
                    p.id,
                    p.sku,
                    p.name,
                    p.product_type,
                    p.category_id,
                    p.base_price,
                    p.is_active,
                    p.created_at,
                    p.updated_at,
                    c.name AS category_name
                FROM products p
                LEFT JOIN product_categories c ON c.id = p.category_id
                ORDER BY p.id DESC
            `).all();
        } catch (error) {
            console.error('[DAO ERROR] getAllProducts:', error.message, error.stack);
            throw new Error('Failed to execute product list query against database.');
        }
    }

    static async getProductById(id) {
        try {
            return db.prepare(`
                SELECT *
                FROM products
                WHERE id = ?
            `).get(id);
        } catch (error) {
            console.error('[DAO ERROR] getProductById:', error.message, error.stack);
            throw error;
        }
    }

    static async getProductBySKU(sku) {
        try {
            return db.prepare(`
                SELECT *
                FROM products
                WHERE sku = ?
            `).get(sku);
        } catch (error) {
            console.error('[DAO ERROR] getProductBySKU:', error.message, error.stack);
            throw error;
        }
    }

    static async searchProducts(keyword) {
        try {
            return db.prepare(`
                SELECT *
                FROM products
                WHERE name LIKE ? OR sku LIKE ? OR color LIKE ?
                ORDER BY id DESC
            `).all(
                `%${keyword}%`,
                `%${keyword}%`,
                `%${keyword}%`
            );
        } catch (error) {
            console.error('[DAO ERROR] searchProducts:', error.message, error.stack);
            throw error;
        }
    }

    static async createProduct(data) {
        try {
            return db.prepare(`
                INSERT INTO products (
                    sku, name, description, category_id, product_type,
                    material, pattern, width_cm, fabric_id,
                    style, gender, size_label, color,
                    unit, base_price, cost_price,
                    is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `).run(
                data.sku,
                data.name,
                data.description || null,
                data.category_id,
                data.product_type,
                data.material || null,
                data.pattern || null,
                data.width_cm || null,
                data.fabric_id || null,
                data.style || null,
                data.gender || null,
                data.size_label || null,
                data.color || null,
                data.unit || 'piece',
                data.base_price,
                data.cost_price || null,
                data.is_active ?? 1
            );
        } catch (error) {
            console.error('[DAO ERROR] createProduct:', error.message, error.stack);
            throw error;
        }
    }

    static async updateProduct(id, fields) {
        try {
            const allowed = [
                'sku', 'name', 'description', 'category_id', 'product_type',
                'material', 'pattern', 'width_cm', 'fabric_id',
                'style', 'gender', 'size_label', 'color',
                'unit', 'base_price', 'cost_price', 'is_active'
            ];

            const keys = Object.keys(fields).filter(k => allowed.includes(k));

            if (!keys.length) {
                return { changes: 0, lastInsertRowid: 0 };
            }

            const clause = keys.map(k => `${k} = ?`).join(', ');
            const params = keys.map(k => fields[k]);
            params.push(id);

            return db.prepare(`
                UPDATE products
                SET ${clause},
                    updated_at = datetime('now')
                WHERE id = ?
            `).run(...params);
        } catch (error) {
            console.error('[DAO ERROR] updateProduct:', error.message, error.stack);
            throw error;
        }
    }

    static async deleteProduct(id) {
        try {
            return db.prepare(`
                DELETE FROM products WHERE id = ?
            `).run(id);
        } catch (error) {
            console.error('[DAO ERROR] deleteProduct:', error.message, error.stack);
            throw error;
        }
    }


    // =====================================================
    // 3. product_images（产品图片）
    // =====================================================

    static async getImagesByProduct(productId) {
        try {
            return db.prepare(`
                SELECT *
                FROM product_images
                WHERE product_id = ?
                ORDER BY sort_order ASC, id ASC
            `).all(productId);
        } catch (error) {
            console.error('[DAO ERROR] getImagesByProduct:', error.message, error.stack);
            throw error;
        }
    }

    static async addImage(data) {
        try {
            return db.prepare(`
                INSERT INTO product_images (
                    product_id, url, sort_order, is_primary
                ) VALUES (?, ?, ?, ?)
            `).run(
                data.product_id,
                data.url,
                data.sort_order ?? 1,
                data.is_primary ?? 0
            );
        } catch (error) {
            console.error('[DAO ERROR] addImage:', error.message, error.stack);
            throw error;
        }
    }

    static async updateImage(id, fields) {
        try {
            const allowed = ['url', 'sort_order', 'is_primary'];
            const keys = Object.keys(fields).filter(k => allowed.includes(k));

            if (!keys.length) {
                return { changes: 0, lastInsertRowid: 0 };
            }

            const clause = keys.map(k => `${k} = ?`).join(', ');
            const params = keys.map(k => fields[k]);
            params.push(id);

            return db.prepare(`
                UPDATE product_images
                SET ${clause}
                WHERE id = ?
            `).run(...params);
        } catch (error) {
            console.error('[DAO ERROR] updateImage:', error.message, error.stack);
            throw error;
        }
    }

    static async deleteImage(id) {
        try {
            return db.prepare(`
                DELETE FROM product_images WHERE id = ?
            `).run(id);
        } catch (error) {
            console.error('[DAO ERROR] deleteImage:', error.message, error.stack);
            throw error;
        }
    }


    // =====================================================
    // 4. 库存列表访问（Stock Accessors: Fabric & Garment）
    // =====================================================

    static async getFabricStock(fabricId) {
        try {
            return db.prepare(`
                SELECT *
                FROM v_fabric_stock
                WHERE fabric_id = ?
            `).get(fabricId);
        } catch (error) {
            console.error('[DAO ERROR] getFabricStock:', error.message, error.stack);
            throw error;
        }
    }

    static async getAllFabricStock() {
        try {
            return db.prepare(`
                SELECT *
                FROM v_fabric_stock
                ORDER BY fabric_id ASC
            `).all();
        } catch (error) {
            console.error('[DAO ERROR] getAllFabricStock:', error.message, error.stack);
            throw error;
        }
    }

    static getGarmentStock(garment_id) {
        try {
            // ★ 修正：改为查询 v_inventory_summary，确保获取总入库和总出库
            return db.prepare(`
            SELECT 
                product_id, 
                sku, 
                name AS product_name, 
                total_in,
                total_out, 
                current_stock AS quantity_on_hand,
                last_transaction AS last_updated 
            FROM v_inventory_summary
            WHERE product_id = ?
        `).get(garment_id);
        } catch (error) {
            console.error('[DAO ERROR] getGarmentStock:', error.message, error.stack);
            throw error;
        }
    }


    /**
     * @description 获取所有成衣的当前库存水平 (修正为来自 v_inventory_summary 视图)
     */
    static async getAllGarmentStock() {
        try {
            // 1. 获取净余额 (来自 V_STOCK_LEVELS)
            const stockLevels = db.prepare(`
                SELECT 
                    sl.product_id, p.sku, p.name AS product_name, 
                    sl.quantity_on_hand AS stock_balance, 
                    sl.last_updated
                FROM stock_levels sl
                JOIN products p ON p.id = sl.product_id
                WHERE p.product_type = 'garment'
            `).all();

            // 2. 获取 IN/OUT 流水聚合 (来自 INVENTORY_TRANSACTIONS)
            const flowData = db.prepare(`
                SELECT 
                    product_id,
                    COALESCE(SUM(CASE WHEN transaction_type = 'in' THEN quantity_change ELSE 0 END), 0) AS total_in,
                    COALESCE(SUM(CASE WHEN transaction_type = 'out' THEN ABS(quantity_change) ELSE 0 END), 0) AS total_used
                FROM inventory_transactions
                WHERE product_id IN (SELECT id FROM products WHERE product_type = 'garment')
                GROUP BY product_id
            `).all();

            const flowMap = new Map();
            flowData.forEach(f => flowMap.set(f.product_id, f));

            // 3. 合并数据并返回 (Garment的 total_in/total_used/stock_balance 字段现在正确匹配 Fabric)
            const finalStock = stockLevels.map(stock => {
                const flow = flowMap.get(stock.product_id) || {};

                return {
                    ...stock,
                    // total_in 和 total_used 来自 Transactions 流水聚合
                    total_in: flow.total_in || 0,
                    total_used: flow.total_used || 0,
                    // stock_balance 来自 stock_levels (已在步骤 1 中别名)
                };
            });

            return finalStock;

        } catch (error) {
            console.error('[DAO ERROR] getAllGarmentStock:', error.message, error.stack);
            // 抛出更精确的错误，便于 Service 层捕获
            throw new Error('Failed to retrieve Garment Stock due to DAO query error.');
        }
    }

    // =====================================================
    // 5. 布料进货（人工录入）
    // =====================================================

    static async recordFabricIncoming(data) {
        try {
            return db.prepare(`
                INSERT INTO fabric_incoming (
                    fabric_id, quantity, unit_price,
                    supplier_name, invoice_number,
                    received_at, created_by, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                data.fabric_id,
                data.quantity,
                data.unit_price || null,
                data.supplier_name || null,
                data.invoice_number || null,
                data.received_at || new Date().toISOString(),
                data.created_by || null,
                data.notes || null
            );
        } catch (error) {
            console.error('[DAO ERROR] recordFabricIncoming:', error.message, error.stack);
            throw error;
        }
    }

    // =====================================================
    // 6. 成衣入库（人工录入）
    // =====================================================

    static async recordGarmentIncoming(data) {
        let incomingInfo;
        try {
            // 步骤 1: 插入成衣入库记录
            incomingInfo = db.prepare(`
                INSERT INTO garment_incoming (
                    garment_id, quantity, unit_cost,
                    batch_id, source_type, source_reference,
                    received_at, created_by, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                data.garment_id,
                data.quantity,
                data.unit_cost || null,
                data.batch_id || null,
                data.source_type || 'production',
                data.source_reference || null,
                data.received_at || new Date().toISOString(),
                data.created_by || null,
                data.notes || null
            );

            // 步骤 2: 记录库存流水 (Inventory Transaction)
            const transactionResult = db.prepare(`
                INSERT INTO inventory_transactions (
                    product_id,
                    transaction_type,
                    quantity_change,
                    reference_type,
                    reference_id,
                    reason,
                    operated_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                data.garment_id,
                'in', // 类型为 'in'
                data.quantity, // 数量为正数
                'garment_incoming',
                incomingInfo.lastInsertRowid, // 引用步骤 1 插入的 ID
                data.notes || (data.source_reference ? `来自 ${data.source_reference}` : '成衣入库'),
                data.created_by || null
            );

            // 返回两个操作的结果，或者仅返回成功标记
            return {
                success: true,
                garmentIncomingId: incomingInfo.lastInsertRowid,
                transactionId: transactionResult.lastInsertRowid
            };

        } catch (error) {
            console.error('[DAO ERROR] recordGarmentIncoming:', error.message, error.stack);
            throw error;
        }
    }

    // =====================================================
    // 7. 布料使用（人工录入）
    // =====================================================

    static async recordFabricUsage(data) {
        try {
            return db.prepare(`
                INSERT INTO garment_fabric_usage (
                    fabric_id, garment_id,
                    used_quantity, usage_type,
                    reference_type, reference_id,
                    used_at, operated_by, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                data.fabric_id,
                data.garment_id || null,
                data.used_quantity,
                data.usage_type || 'cut',
                data.reference_type || null,
                data.reference_id || null,
                data.used_at || new Date().toISOString(),
                data.operated_by || null,
                data.notes || null
            );
        } catch (error) {
            console.error('[DAO ERROR] recordFabricUsage:', error.message, error.stack);
            throw error;
        }
    }

    // =====================================================
    // 8. 成衣销售/出库（真正扣库存）—— 完全抄 recordFabricUsage 的写法
    // =====================================================

    static recordGarmentSale(data) {
        try {
            // 完全模仿 recordFabricUsage 的结构和字段
            const info = db.prepare(`
            INSERT INTO inventory_transactions (
                product_id,
                transaction_type,
                quantity_change,
                reference_type,
                reference_id,
                reason,
                operated_by,
                created_at,
                item_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
                data.garment_id,                              // product_id → garment_id
                'out',                                        // transaction_type
                -Math.abs(data.quantity),                     // quantity_change → 负数
                data.sale_type || 'retail_sale',              // reference_type
                data.reference_id ? Number(data.reference_id) : null,  // 数字引用ID
                data.reference || data.notes || '成衣销售出库', // reason 存文字说明
                data.operated_by,                             // 操作人
                data.created_at || new Date().toISOString(),  // 时间
                data.item_id || null                          // 唯一项ID（可选）
            );

            // 必须 return 出去！（这才是你之前一直报 undefined 的真正原因）
            return info;

        } catch (error) {
            console.error('[DAO ERROR] recordGarmentSale:', error.message, error.stack);
            throw error;
        }
    }

    // =====================================================
    // 9. Unique Inventory Items (Barcodes/序列号管理)
    // =====================================================

    /**
     * @description 创建一个新的唯一库存项（例如：在生产或采购时）
     * @param {object} data - { product_id, unique_code, status, location_id }
     */
    static async createUniqueItem(data) {
        try {
            return db.prepare(`
                INSERT INTO inventory_items (
                    product_id, unique_code, status, location_id, received_at
                ) VALUES (?, ?, ?, ?, datetime('now'))
            `).run(
                data.product_id,
                data.unique_code,
                data.status || 'In Stock',
                data.location_id || null
            );
        } catch (error) {
            console.error('[DAO ERROR] createUniqueItem:', error.message, error.stack);
            throw error;
        }
    }

    /**
     * @description 通过唯一的条形码或序列号查找库存项
     * @param {string} uniqueCode
     */
    static async getUniqueItemByCode(uniqueCode) {
        try {
            return db.prepare(`
                SELECT *
                FROM inventory_items
                WHERE unique_code = ?
            `).get(uniqueCode);
        } catch (error) {
            console.error('[DAO ERROR] getUniqueItemByCode:', error.message, error.stack);
            throw error;
        }
    }

    /**
     * @description 更新库存项的状态
     * @param {number} itemId
     * @param {string} newStatus
     */
    static async updateUniqueItemStatus(itemId, newStatus) {
        try {
            return db.prepare(`
                UPDATE inventory_items
                SET status = ?
                WHERE id = ?
            `).run(newStatus, itemId);
        } catch (error) {
            console.error('[DAO ERROR] updateUniqueItemStatus:', error.message, error.stack);
            throw error;
        }
    }
}

export default ProductsDAO;