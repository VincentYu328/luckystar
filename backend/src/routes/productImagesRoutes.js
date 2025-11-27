import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ProductImagesService from '../services/productImagesService.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const ROOT = process.cwd();
const router = express.Router();

// Multer 配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const productId = req.params.id;
    const dir = path.join(ROOT, 'uploads', 'products', String(productId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = Date.now() + ext;
    cb(null, name);
  }
});

function fileFilter(req, file, cb) {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Invalid file type. Allowed: JPG, PNG, WEBP.'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 上传图片
router.post('/:id/upload', 
  requireAuth, 
  requirePermission('products.update'),
  upload.single('image'), 
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
      }

      const fileUrl = `/uploads/products/${productId}/${req.file.filename}`;

      const result = ProductImagesService.addImage(req.user?.id ?? null, {
        product_id: productId,
        url: fileUrl
      });

      return res.json({
        success: true,
        url: fileUrl,
        image_id: result.id
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
});

// 删除图片
router.delete('/:imageId',
  requireAuth,
  requirePermission('products.update'),
  async (req, res) => {
    try {
      const imageId = Number(req.params.imageId);
      const result = ProductImagesService.deleteImage(req.user?.id ?? null, imageId);
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ success: false, error: err.message });
    }
});

// 设置主图
router.put('/:imageId/primary',
  requireAuth,
  requirePermission('products.update'),
  async (req, res) => {
    try {
      const imageId = Number(req.params.imageId);
      const result = ProductImagesService.setPrimary(req.user?.id ?? null, imageId);
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ success: false, error: err.message });
    }
});

export default router;