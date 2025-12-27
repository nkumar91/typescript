import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as productController from '../controller/Product.Controller';
import { createProductValidation, updateProductValidation } from '../utils/validators';

const productRouter = express.Router();

// Ensure upload folder exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'products');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({ storage });

productRouter.post('/', upload.single('productImage'), createProductValidation, productController.createProduct);
productRouter.get('/search', productController.searchProducts);
productRouter.get('/', productController.getProducts);
productRouter.get('/:id', productController.getProductById);
productRouter.put('/:id', upload.single('productImage'), updateProductValidation, productController.updateProduct);
productRouter.delete('/:id', productController.deleteProduct);

export default productRouter;
