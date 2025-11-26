import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ProductImagesService from '../services/productImagesService.js';

// 项目根路径（用于生成绝对路径）
const ROOT = process.cwd();

const router = express.Router();

/**
 * 上传目录：/uploads/products/{id}/
 * 物理路径：/var/www/luckystar/uploads/products/{id}/
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const productId = req.params.id;

    const dir = path.join(ROOT, 'uploads', 'products', String(productId));

    // 递归创建目录
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = Date.now() + ext;
    cb(null, name);
  }
});

// 限制上传文件类型（安全必备）
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/**
 * ============================================================
 * 上传产品图片
 * POST /api/product-images/:id/upload
 * FormData:
 *   - image (file)
 * ============================================================
 */
router.post('/:id/upload', upload.single('image'), async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // 生成前端可访问的 URL
    const fileUrl = `/uploads/products/${productId}/${req.file.filename}`;

    // 使用 Service 层（遵循架构）
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

export default router;
