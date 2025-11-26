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
router.get('/categories', (req, res) => {
  const categories = ProductService.getAllCategories();
  res.json({ count: categories.length, categories });
});

// 公开访问 - 查看单个分类
router.get('/categories/:id', (req, res) => {
  try {
    const cat = ProductService.getCategoryById(Number(req.params.id));
    res.json(cat);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// 需要认证 - 创建分类
router.post(
  '/categories',
  requireAuth,
  requirePermission('products.create'),
  (req, res) => {
    try {
      const result = ProductService.createCategory(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 需要认证 - 更新分类
router.put(
  '/categories/:id',
  requireAuth,
  requirePermission('products.update'),
  (req, res) => {
    try {
      const result = ProductService.updateCategory(
        req.user.id,
        Number(req.params.id),
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 需要认证 - 删除分类
router.delete(
  '/categories/:id',
  requireAuth,
  requirePermission('products.delete'),
  (req, res) => {
    try {
      const result = ProductService.deleteCategory(
        req.user.id,
        Number(req.params.id)
      );
      res.json(result);
    } catch (err) {
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
router.get('/', (req, res) => {
  const list = ProductService.getAllProducts();
  res.json({ count: list.length, products: list });
});

// 公开访问 - 查看单个产品
router.get('/:id', (req, res) => {
  try {
    const item = ProductService.getProductById(Number(req.params.id));
    res.json(item);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// 需要认证 - 创建产品
router.post(
  '/',
  requireAuth,
  requirePermission('products.create'),
  (req, res) => {
    try {
      const result = ProductService.createProduct(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 需要认证 - 更新产品
router.put(
  '/:id',
  requireAuth,
  requirePermission('products.update'),
  (req, res) => {
    try {
      const result = ProductService.updateProduct(
        req.user.id,
        Number(req.params.id),
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 需要认证 - 删除产品
router.delete(
  '/:id',
  requireAuth,
  requirePermission('products.delete'),
  (req, res) => {
    try {
      const result = ProductService.deleteProduct(
        req.user.id,
        Number(req.params.id)
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);


/**
 * ======================================================
 * 产品图片（product_images）
 * ======================================================
 */

// 公开访问 - 查看产品图片
router.get('/:id/images', (req, res) => {
  const images = ProductService.getImagesByProduct(Number(req.params.id));
  res.json({ count: images.length, images });
});

// 需要认证 - 添加图片
router.post(
  '/:id/images',
  requireAuth,
  requirePermission('products.update'),
  (req, res) => {
    try {
      const result = ProductService.addImage(
        req.user.id,
        Number(req.params.id),
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 需要认证 - 更新图片
router.put(
  '/images/:imageId',
  requireAuth,
  requirePermission('products.update'),
  (req, res) => {
    try {
      const result = ProductService.updateImage(
        req.user.id,
        Number(req.params.imageId),
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 需要认证 - 删除图片
router.delete(
  '/images/:imageId',
  requireAuth,
  requirePermission('products.update'),
  (req, res) => {
    try {
      const result = ProductService.deleteImage(
        req.user.id,
        Number(req.params.imageId)
      );
      res.json(result);
    } catch (err) {
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
router.get('/fabric/stock', (req, res) => {
  const list = ProductService.getAllFabricStock();
  res.json({ count: list.length, stock: list });
});

// 需要认证 - 记录布料入库
router.post(
  '/fabric/incoming',
  requireAuth,
  requirePermission('inventory.in'),
  (req, res) => {
    try {
      const result = ProductService.recordFabricIncoming(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 需要认证 - 记录布料使用
router.post(
  '/fabric/usage',
  requireAuth,
  requirePermission('inventory.out'),
  (req, res) => {
    try {
      const result = ProductService.recordFabricUsage(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;