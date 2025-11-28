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
 * 布料库存：incoming / usage / stock
 * ======================================================
 */

// 公开访问 - 查看布料库存
router.get('/fabric/stock', async (req, res) => { // ✅ Already async
    try {
        const list = await ProductService.getAllFabricStock(); // ✅ Already awaited
        res.json({ count: list.length, stock: list });
    } catch (err) {
        console.error("Error fetching fabric stock:", err); // Add error log
        res.status(500).json({ error: "Failed to fetch fabric stock." });
    }
});

// 需要认证 - 记录布料入库
router.post(
    '/fabric/incoming',
    requireAuth,
    requirePermission('inventory.in'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.recordFabricIncoming(req.user.id, req.body); // ✅ Await Service call
            res.status(201).json(result);
        } catch (err) {
            console.error('Error recording fabric incoming:', err); // Add error log
            res.status(400).json({ error: err.message });
        }
    }
);

// 需要认证 - 记录布料使用
router.post(
    '/fabric/usage',
    requireAuth,
    requirePermission('inventory.out'),
    async (req, res) => { // ✅ Made async
        try {
            const result = await ProductService.recordFabricUsage(req.user.id, req.body); // ✅ Await Service call
            res.status(201).json(result);
        } catch (err) {
            console.error('Error recording fabric usage:', err); // Add error log
            res.status(400).json({ error: err.message });
        }
    }
);

export default router;