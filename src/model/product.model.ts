import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface ProductAttributes {
  id: number;
  productName: string;
  productPrice: number;
  description?: string;
  sku?: string;
  // Relative or absolute path to product image
  productImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductCreationAttributes = Optional<ProductAttributes, "id" | "createdAt" | "updatedAt">;

export class Product extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes {
  public id!: number;
  public productName!: string;
  public productPrice!: number;
  public description?: string;
  public sku?: string;
  public productImage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    productPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    productImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "Product",
    modelName: "User",
    timestamps: true,
  }
);
