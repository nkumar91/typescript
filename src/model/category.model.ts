import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";


interface CategoryAttributes {
  id: number;
  catName: string;
  catDesc: string;
  catSlug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CategoryCreationAttributes = Optional<CategoryAttributes, "id" | "createdAt" | "updatedAt">;

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes {
  public id!: number;
  public catName!: string;
  public catDesc!: string;
  public catSlug!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    catName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    catDesc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    catSlug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
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
    tableName: "categories",
    modelName: "Category",
    timestamps: true,
  }
);
