import express from 'express';
import ProductService from '../services/productService.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = express.Router();

/**
 * ======================================================
 * Product Categories
 * ======================================================
 */

// 公开访问 - 查看所有分类
router.get('/categories', async (req, res) => { // ✅ Made async
    try {
        const categories = await ProductService.getAllCategories(); // ✅ Await Service call
        res.json({ count: categories.length, categories });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
});

// 公开访问 - 查看单个分类
router.get('/categories/:id', async (req, res) => { // ✅ Made async
    try {
        const cat = await ProductService.getCategoryById(Number(req.params.id)); // ✅ Await Service call
        res.json(cat);
    } catch (err) {
        console.error(`Error getting category ${req.params.id}:`, err); // Add error log
        res.status(404).json({ error: err.message });
    }
});

// 需要认证 - 创建分类
router.post(
    '/categories',
    requireAuth,
    requirePermission('products.create'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.createCategory(req.user.id, req.body); // ✅ Await Service call
            res.status(201).json(result); // 201 Created for successful creation
        } catch (err) {
            console.error('Error creating category:', err); // Add error log
            res.status(400).json({ error: err.message });
        }
    }
);

// 需要认证 - 更新分类
router.put(
    '/categories/:id',
    requireAuth,
    requirePermission('products.update'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.updateCategory( // ✅ Await Service call
                req.user.id,
                Number(req.params.id),
                req.body
            );
            res.json(result);
        } catch (err) {
            console.error(`Error updating category ${req.params.id}:`, err); // Add error log
            res.status(400).json({ error: err.message });
        }
    }
);

// 需要认证 - 删除分类
router.delete(
    '/categories/:id',
    requireAuth,
    requirePermission('products.delete'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.deleteCategory( // ✅ Await Service call
                req.user.id,
                Number(req.params.id)
            );
            res.json(result);
        } catch (err) {
            console.error(`Error deleting category ${req.params.id}:`, err); // Add error log
            res.status(400).json({ error: err.message });
        }
    }
);


/**
 * ======================================================
 * Products（成衣 + 布料）
 * ======================================================
 */

// 公开访问 - 查看所有产品
router.get('/', async (req, res) => { // ✅ Made async
    try {
        const list = await ProductService.getAllProducts(); // ✅ Await Service call
        res.json({ count: list.length, products: list });
    } catch (err) {
        console.error('Error fetching all products:', err);
        res.status(500).json({ error: 'Failed to fetch products.' });
    }
});

// 公开访问 - 查看单个产品
router.get('/:id', async (req, res) => { // ✅ Made async
    try {
        const item = await ProductService.getProductById(Number(req.params.id)); // ✅ Await Service call
        res.json(item);
    } catch (err) {
        console.error(`Error getting product ${req.params.id}:`, err); // Add error log
        res.status(404).json({ error: err.message });
    }
});

// 需要认证 - 创建产品
router.post(
    '/',
    requireAuth,
    requirePermission('products.create'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.createProduct(req.user.id, req.body); // ✅ Await Service call
            res.status(201).json(result); // 201 Created for successful creation
        } catch (err) {
            console.error('Error creating product:', err); // Add error log
            res.status(400).json({ error: err.message });
        }
    }
);

// 需要认证 - 更新产品
router.put(
    '/:id',
    requireAuth,
    requirePermission('products.update'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.updateProduct( // ✅ Await Service call
                req.user.id,
                Number(req.params.id),
                req.body
            );
            res.json(result);
        } catch (err) {
            console.error(`Error updating product ${req.params.id}:`, err); // Add error log
            res.status(400).json({ error: err.message });
        }
    }
);

// 需要认证 - 删除产品
router.delete(
    '/:id',
    requireAuth,
    requirePermission('products.delete'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.deleteProduct( // ✅ Await Service call
                req.user.id,
                Number(req.params.id)
            );
            res.json(result); // 这将返回 { success: true, message: "..." }
        } catch (err) {
            console.error(`Error deleting product ${req.params.id}:`, err); // Add error log
            res.status(400).json({ error: err.message }); // 如果 Service 层抛出错误，这里会捕获并返回
        }
    }
);


/**
 * ======================================================
 * 产品图片（product_images）
 * ======================================================
 */

// 公开访问 - 查看产品图片
router.get('/:id/images', async (req, res) => { // ✅ Made async
    try {
        const images = await ProductService.getImagesByProduct(Number(req.params.id)); // ✅ Await Service call
        res.json({ count: images.length, images });
    } catch (err) {
        console.error(`Error fetching images for product ${req.params.id}:`, err);
        res.status(500).json({ error: 'Failed to fetch product images.' });
    }
});

// 需要认证 - 添加图片
router.post(
    '/:id/images',
    requireAuth,
    requirePermission('products.update'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.addImage( // ✅ Await Service call
                req.user.id,
                Number(req.params.id),
                req.body
            );
            res.status(201).json(result);
        } catch (err) {
            console.error(`Error adding image for product ${req.params.id}:`, err); // Add error log
            res.status(400).json({ error: err.message });
        }
    }
);

// 需要认证 - 更新图片
router.put(
    '/images/:imageId',
    requireAuth,
    requirePermission('products.update'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.updateImage( // ✅ Await Service call
                req.user.id,
                Number(req.params.imageId),
                req.body
            );
            res.json(result);
        } catch (err) {
            console.error(`Error updating image ${req.params.imageId}:`, err); // Add error log
            res.status(400).json({ error: err.message });
        }
    }
);

// 需要认证 - 删除图片
router.delete(
    '/images/:imageId',
    requireAuth,
    requirePermission('products.update'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.deleteImage( // ✅ Await Service call
                req.user.id,
                Number(req.params.imageId)
            );
            res.json(result);
        } catch (err) {
            console.error(`Error deleting image ${req.params.imageId}:`, err); // Add error log
            res.status(400).json({ error: err.message });
        }
    }
);

/**
 * ======================================================
 * 库存管理（新增/对齐）
 * ======================================================
 */

// ------------------------------------------------------
// 1. 库存列表查询 (Stock Queries)
// ------------------------------------------------------

// 公开访问 - 查看布料库存 (GET /products/fabric/stock)
router.get('/fabric/stock', async (req, res) => {
    try {
        const list = await ProductService.getAllFabricStock();
        res.json({ count: list.length, stock: list }); // 返回键名 'stock'
    } catch (err) {
        console.error("Error fetching fabric stock:", err);
        res.status(500).json({ error: "Failed to fetch fabric stock." });
    }
});

// ⭐ 新增/对齐：公开访问 - 查看成衣库存 (GET /products/garment/stock)
router.get('/garment/stock', async (req, res) => {
    try {
        const list = await ProductService.getAllGarmentStock();
        res.json({ count: list.length, stock: list }); // 返回键名 'stock'
    } catch (err) {
        console.error("Error fetching garment stock:", err);
        res.status(500).json({ error: "Failed to fetch garment stock." });
    }
});


// ------------------------------------------------------
// 2. 布料操作 (Fabric Operations)
// ------------------------------------------------------

// 需要认证 - 记录布料入库 (POST /products/fabric/incoming)
router.post(
    '/fabric/incoming',
    requireAuth,
    requirePermission('inventory.in'),
    async (req, res) => {
        try {
            const result = await ProductService.recordFabricIncoming(req.user.id, req.body);
            res.status(201).json(result);
        } catch (err) {
            console.error('Error recording fabric incoming:', err);
            res.status(400).json({ error: err.message });
        }
    }
);

// 需要认证 - 记录布料使用/出库 (POST /products/fabric/usage)
router.post(
    '/fabric/usage',
    requireAuth,
    requirePermission('inventory.out'),
    async (req, res) => {
        try {
            const result = await ProductService.recordFabricUsage(req.user.id, req.body);
            res.status(201).json(result);
        } catch (err) {
            console.error('Error recording fabric usage:', err);
            res.status(400).json({ error: err.message });
        }
    }
);


// ------------------------------------------------------
// 3. 成衣操作 (Garment Operations)
// ------------------------------------------------------

// 记录成衣入库批次 (POST /products/garment/incoming)
router.post(
    '/garment/incoming',
    requireAuth,
    requirePermission('inventory.in'),
    async (req, res) => {
        try {
            const result = await ProductService.recordGarmentIncoming(req.user.id, req.body);
            res.status(201).json(result);
        } catch (err) {
            console.error('Error recording garment incoming:', err);
            res.status(400).json({ error: err.message });
        }
    }
);

router.post(
    '/garment/sale',
    requireAuth,
    requirePermission('inventory.out'),
    async (req, res) => {
        try {
            // 确保 Service 层返回的是 { success: true, id: X }
            const result = await ProductService.recordGarmentSale(req.user.id, req.body);

            // ✅ 成功：返回 201 Created，将 Service 的结构化结果作为 JSON 响应体
            res.status(201).json(result); 

        } catch (err) {
            // 失败：捕获 Service 层抛出的任何错误（如库存不足、校验失败）
            console.error('[ROUTE ERROR] recordGarmentSale:', err.message, err.stack);
            
            // 返回 400 Bad Request，将错误信息传给前端
            res.status(400).json({ error: err.message });
        }
    }
);


// ------------------------------------------------------
// 4. 唯一项及通用库存操作 (Unique Items & General)
// ------------------------------------------------------

// 创建单个唯一库存项/条码 (POST /products/inventory/item)
router.post(
    '/inventory/item',
    requireAuth,
    requirePermission('inventory.in'),
    async (req, res) => {
        try {
            const result = await ProductService.createUniqueItem(req.user.id, req.body);
            res.status(201).json(result);
        } catch (err) {
            console.error('Error creating unique inventory item:', err);
            res.status(400).json({ error: err.message });
        }
    }
);

// 通过条码查找唯一项详情 (GET /products/inventory/item/:uniqueCode)
router.get(
    '/inventory/item/:uniqueCode',
    requireAuth,
    requirePermission('inventory.view'),
    async (req, res) => {
        try {
            const itemDetails = await ProductService.getUniqueItemDetails(req.params.uniqueCode);
            res.json(itemDetails);
        } catch (err) {
            console.error(`Error fetching unique item ${req.params.uniqueCode}:`, err);
            res.status(404).json({ error: err.message });
        }
    }
);

export default router;