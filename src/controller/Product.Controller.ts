import { Request, Response, NextFunction } from 'express';
import { Product } from '../model/product.model';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

// Helper to build image URL / path
const buildImagePath = (filename?: string) => {
  if (!filename) return null;
  return `/uploads/products/${filename}`;
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msgs = errors.array().map(e => e.msg);
      return res.status(400).json({ status: 'failed', message: msgs });
    }

    const { productName, productPrice, description, sku } = req.body;
    let productImage: any ;
    if ((req as any).file) {
      productImage = buildImagePath((req as any).file.filename)!;
    }

    const newProduct = await Product.create({
      productName,
      productPrice,
      description,
      sku,
      productImage,
    });

    res.status(201).json({ status: 'success', message: 'Product created', data: newProduct });
  } catch (err) {
    next(err);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = Math.min(parseInt((req.query.limit as string) || '10', 10), 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || undefined;

    const where: any = {};
    if (search) where.productName = { [Op.like]: `%${search}%` };
    //const result = await Product.findAndCountAll({ where:{productName: { [Op.like]: `%${search}%` }}, limit, offset });
    const result = await Product.findAndCountAll({ where, limit, offset });
    res.json({ status: 'success', data: { total: result.count, items: result.rows } });
  } catch (err) {
    next(err);
  }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string) || '';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const sku = (req.query.sku as string) || undefined;

    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = Math.min(parseInt((req.query.limit as string) || '10', 10), 100);
    const offset = (page - 1) * limit;

    const where: any = {};

    if (q) {
      // search in name, sku or description
      where[Op.or] = [
        { productName: { [Op.like]: `%${q}%` } },
        { sku: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    if (sku) {
      where.sku = sku;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.productPrice = {};
      if (minPrice !== undefined) where.productPrice[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.productPrice[Op.lte] = maxPrice;
    }

    // Sorting
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.order as string) === 'asc' ? 'ASC' : 'DESC';

    const result = await Product.findAndCountAll({ where, limit, offset, order: [[sortBy, sortOrder]] });

    res.json({ status: 'success', data: { total: result.count, items: result.rows } });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ status: 'failed', message: 'Product not found' });
    res.json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msgs = errors.array().map(e => e.msg);
      return res.status(400).json({ status: 'failed', message: msgs });
    }

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ status: 'failed', message: 'Product not found' });

    const updates: any = req.body;
    if ((req as any).file) {
      updates.productImage = buildImagePath((req as any).file.filename);
    }

    await product.update(updates);
    res.json({ status: 'success', message: 'Product updated', data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ status: 'failed', message: 'Product not found' });

    // Remove image file if present
    if (product.productImage) {
      const filePath = path.join(process.cwd(), product.productImage.replace(/^\//, ''));
      fs.unlink(filePath, () => {});
    }

    await product.destroy();
    res.json({ status: 'success', message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};


