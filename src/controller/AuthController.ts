import { Response, Request, NextFunction } from "express"
import { User } from "../model/user.model";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
// type User = {
//     name:string,
//     email:string,
//     password:string,
//     phone:string
// }
export const signup = async (req: Request, res: Response) => {
    try {
        const bodyData = req.body;
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(bodyData.password, salt);
        
        // Create user with hashed password
        const userDataWithHashedPassword = {
            ...bodyData,
            password: hashedPassword
        };
        
        const info = await User.create(userDataWithHashedPassword);
        const resData = info.toJSON();
        if (resData) {
            res.json({
                status:"success",
                message:"Signup Successfully",
                data: {
                    id:info.id,
                    name:resData.name,
                    email:resData.email,
                }
            })
        }
        else{

        }

    } catch (err) {
        console.error("Sql Error",err);
        res.json({
                status:"failed",
                message:"email alredy exits"
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
    const { email, password } = req.body;
    const getUser = await User.findOne({where:{[Op.and]:[{email:email},{password:password}]}});
    res.json({
       getUser
    })