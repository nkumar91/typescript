import {
  sequelize
} from "./chunk-FSIT3LXZ.js";

// src/model/user.model.ts
import { DataTypes, Model } from "sequelize";
var User = class extends Model {
  id;
  name;
  email;
  phone;
  password;
  createdAt;
  updatedAt;
};
User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(16)
    }
  },
  {
    sequelize,
    // connection
    tableName: "users",
    // DB table name
    modelName: "User",
    // Sequelize model name
    timestamps: true
  }
);

export {
  User
};
//# sourceMappingURL=chunk-7Z7EU3X5.js.map