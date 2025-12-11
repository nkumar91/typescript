import { Response, Request, NextFunction } from "express"
import { User } from "../model/user.model";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
// type User = {
//     name:string,
//     email:string,
//     password:string,
//     phone:string
// }
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
            res.status(201).json({
                status:"success",
                message:"Signup Successfully",
                data: {
                    id:info.id,
                    name:resData.name,
                    email:resData.email,
                    phone:resData.phone
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
        const getUser = await User.findOne({where:{email:email}});
        
        if (!getUser) {
            console.warn(`Login attempt with non-existent email: ${email}`);
            res.status(401).json({
                status: "failed",
                message: "Invalid email or password"
            });
            return;
        }
        
        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, getUser.password);
        
        if (!isPasswordValid) {
            console.warn(`Failed login attempt for email: ${email}`);
            res.status(401).json({
                status: "failed",
                message: "Invalid email or password"
            });
            return;
        }
        
        // Login successful
        console.log(`User logged in successfully: ${email}`);
        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                id: getUser.id,
                name: getUser.name,
                email: getUser.email,
                phone: getUser.phone
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