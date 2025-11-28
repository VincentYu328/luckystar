// backend/src/data/products-dao.js
import db from '../database/db.js';

class ProductsDAO {

    // =====================================================
    // 1. product_categories（分类）
    // =====================================================

    static async getAllCategories() { // ✅ Added async
        return db.prepare(`
            SELECT *
            FROM product_categories
            ORDER BY sort_order ASC, id ASC
        `).all();
    }

    static async getCategoryById(id) { // ✅ Added async
        return db.prepare(`
            SELECT *
            FROM product_categories
            WHERE id = ?
        `).get(id);
    }

    static async getCategoryByCode(code) { // ✅ Added async
        return db.prepare(`
            SELECT *
            FROM product_categories
            WHERE code = ?
        `).get(code);
    }

    static async createCategory(data) { // ✅ Added async
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
    }

    static async updateCategory(id, fields) { // ✅ Added async
        const allowed = ['code', 'name', 'parent_id', 'sort_order', 'is_active'];
        const keys = Object.keys(fields).filter(k => allowed.includes(k));
        // 确保即使没有可更新的字段也返回一个 run() 类似的结果对象，以便 Service 层可以检查 .changes
        if (!keys.length) return { changes: 0, lastInsertRowid: 0 }; 

        const clause = keys.map(k => `${k} = ?`).join(', ');
        const params = keys.map(k => fields[k]);
        params.push(id);

        return db.prepare(`
            UPDATE product_categories
            SET ${clause}
            WHERE id = ?
        `).run(...params);
    }

    static async deleteCategory(id) { // ✅ Added async
        return db.prepare(`
            DELETE FROM product_categories WHERE id = ?
        `).run(id);
    }


    // =====================================================
    // 2. products（布料 + 成衣）
    // =====================================================

    static async getAllProducts() { // ✅ Added async
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
    }

    static async getProductById(id) { // ✅ Added async
        return db.prepare(`
            SELECT *
            FROM products
            WHERE id = ?
        `).get(id);
    }

    static async getProductBySKU(sku) { // ✅ Added async
        return db.prepare(`
            SELECT *
            FROM products
            WHERE sku = ?
        `).get(sku);
    }

    static async searchProducts(keyword) { // ✅ Added async
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
    }

    static async createProduct(data) { // ✅ Added async
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
    }

    static async updateProduct(id, fields) { // ✅ Added async
        const allowed = [
            'sku', 'name', 'description', 'category_id', 'product_type',
            'material', 'pattern', 'width_cm', 'fabric_id',
            'style', 'gender', 'size_label', 'color',
            'unit', 'base_price', 'cost_price', 'is_active'
        ];

        const keys = Object.keys(fields).filter(k => allowed.includes(k));
        // 确保即使没有可更新的字段也返回一个 run() 类似的结果对象
        if (!keys.length) return { changes: 0, lastInsertRowid: 0 }; 

        const clause = keys.map(k => `${k} = ?`).join(', ');
        const params = keys.map(k => fields[k]);
        params.push(id);

        return db.prepare(`
            UPDATE products
            SET ${clause},
                updated_at = datetime('now')
            WHERE id = ?
        `).run(...params);
    }

    static async deleteProduct(id) { // ✅ Added async
        return db.prepare(`
            DELETE FROM products WHERE id = ?
        `).run(id);
    }


    // =====================================================
    // 3. product_images（产品图片）
    // =====================================================

    static async getImagesByProduct(productId) { // ✅ Added async
        return db.prepare(`
            SELECT *
            FROM product_images
            WHERE product_id = ?
            ORDER BY sort_order ASC, id ASC
        `).all(productId);
    }

    static async addImage(data) { // ✅ Added async
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
    }

    static async updateImage(id, fields) { // ✅ Added async
        const allowed = ['url', 'sort_order', 'is_primary'];
        const keys = Object.keys(fields).filter(k => allowed.includes(k));
        if (!keys.length) return { changes: 0, lastInsertRowid: 0 }; // Consistent return

        const clause = keys.map(k => `${k} = ?`).join(', ');
        const params = keys.map(k => fields[k]);
        params.push(id);

        return db.prepare(`
            UPDATE product_images
            SET ${clause}
            WHERE id = ?
        `).run(...params);
    }

    static async deleteImage(id) { // ✅ Added async
        return db.prepare(`
            DELETE FROM product_images WHERE id = ?
        `).run(id);
    }


    // =====================================================
    // 4. 布料库存：v_fabric_stock（自动统计）
    // =====================================================

    static async getFabricStock(fabricId) { // ✅ Added async
        return db.prepare(`
            SELECT *
            FROM v_fabric_stock
            WHERE fabric_id = ?
        `).get(fabricId);
    }

    static async getAllFabricStock() { // ✅ Added async
        return db.prepare(`
            SELECT *
            FROM v_fabric_stock
            ORDER BY fabric_id ASC
        `).all();
    }


    // =====================================================
    // 5. 布料进货（人工录入）
    // =====================================================

    static async recordFabricIncoming(data) { // ✅ Added async
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
    }


    // =====================================================
    // 6. 布料使用（人工录入）
    // =====================================================

    static async recordFabricUsage(data) { // ✅ Added async
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
    }
}

export default ProductsDAO;