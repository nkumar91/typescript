import { Response, Request, NextFunction } from "express"
import { User } from "../model/user.model";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { signJwt } from "../utils/jwt";

export const signup = async (req: Request, res: Response) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(err => err.msg);
            res.status(400).json({
                status: "failed",
                message: errorMessages
            });
            return;
        }

        const { name, email, password, phone } = req.body;
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user with hashed password
        const info = await User.create({
            name,
            email,
            phone,
            password: hashedPassword
        });
        
        const resData = info.toJSON();
        if (resData) {
            const token = signJwt({ id: info.id, email: resData.email });
            res.status(201).json({
                status:"success",
                message:"Signup Successfully",
                data: {
                    id:info.id,
                    name:resData.name,
                    email:resData.email,
                    phone:resData.phone,
                    token
                }
            })
        }

    } catch (err) {
        console.error("Sql Error",err);
        res.status(500).json({
                status:"failed",
                message:"email or phone already exists"
                }
            )
    }
}

export const getData = (req: Request, res: Response, next: NextFunction) => {
    const { name, age } = req.query;
    res.json({
        data: name
    })
}

export const authLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(err => err.msg);
            res.status(400).json({
                status: "failed",
                message: errorMessages
            });
            return;
        }

        const { email, password } = req.body;
        
        // Check if user exists in database
        const getUser = await User.findOne({
            where: { email: email },
            attributes: ['id', 'name', 'email', 'phone', 'password'],
            raw: true
        });
        if (!getUser) {
            console.warn(`Login attempt with non-existent email: ${email}`);
            res.status(401).json({
                status: "failed",
                message: "Invalid email"
            });
            return;
        }
        
        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, getUser.password);
        
        if (!isPasswordValid) {
            console.warn(`Failed login attempt for email: ${email}`);
            res.status(401).json({
                status: "failed",
                message: "Invalid password"
            });
            return;
        }
        
        // Login successful — issue JWT token
        console.log(`User logged in successfully: ${email}`);
        const token = signJwt({ id: getUser.id, email: getUser.email });
        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                id: getUser.id,
                name: getUser.name,
                email: getUser.email,
                phone: getUser.phone,
                token
            }
        })
    } catch (err) {
        console.error("Login Error", err);
        res.status(500).json({
            status: "failed",
            message: "Internal server error"
        })
    }
}

export const getDataByParam = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    res.json({
        data: id
    })
}

export const formDataHandle = (req: Request<{}, {}, User>, res: Response) => {
    try {
        const bodyData: User = req.body;
        res.json({
            allData: bodyData
        })
    } catch (err) {

    }
}