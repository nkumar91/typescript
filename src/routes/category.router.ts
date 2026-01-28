import express from 'express';
import * as categoryController from '../controller/category.controller';
import { createCategoryValidation, updateCategoryValidation } from '../utils/validators';
import { requireAuth } from '../middleware/auth';

const categoryRouter = express.Router();





categoryRouter.post('/',requireAuth, createCategoryValidation, categoryController.createCategory);
//categoryRouter.get('/search', categoryController.searchCategories);
categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get('/:id', categoryController.getCategoryById);
categoryRouter.delete('/:id', categoryController.deleteCategory);   
categoryRouter.put('/:id', updateCategoryValidation, categoryController.updateCategory);    
export default categoryRouter;
