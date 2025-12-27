import { body, ValidationChain } from 'express-validator';

// Signup validation middleware
export const signupValidation: ValidationChain[] = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10,12}$/).withMessage('Phone must be 10-12 digits')
];

// Login validation middleware
export const loginValidation: ValidationChain[] = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Product validation
export const createProductValidation: ValidationChain[] = [
    body('productName')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
    body('productPrice')
        .notEmpty().withMessage('Product price is required')
        .isFloat({ gt: 0 }).withMessage('Product price must be a number greater than 0'),
    body('description')
        .optional()
        .isLength({ max: 2000 }).withMessage('Description is too long'),
    body('sku')
        .optional()
        .isAlphanumeric().withMessage('SKU must be alphanumeric')
];

export const updateProductValidation: ValidationChain[] = [
    body('productName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
    body('productPrice')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Product price must be a number greater than 0'),
    body('description')
        .optional()
        .isLength({ max: 2000 }).withMessage('Description is too long'),
    body('sku')
        .optional()
        .isAlphanumeric().withMessage('SKU must be alphanumeric')
];
