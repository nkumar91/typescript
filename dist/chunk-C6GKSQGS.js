import {
  User
} from "./chunk-7Z7EU3X5.js";

// src/controller/AuthController.ts
var signup = async (req, res) => {
  try {
    const bodyData = req.body;
    const info = await User.create(bodyData);
    const resData = info.toJSON();
    if (resData) {
      res.json({
        status: "success",
        message: "Signup Successfully",
        data: {
          id: info.id,
          name: resData.name,
          email: resData.email
        }
      });
    } else {
    }
  } catch (err) {
    console.error("Sql Error", err);
    res.json(
      {
        status: "failed",
        message: "email alredy exits"
      }
    );
  }
};
var getData = (req, res, next) => {
  const { name, age } = req.query;
  res.json({
    data: name
  });
};
var authLogin = async (req, res, next) => {
  const getUser = await User.findOne({ where: { id: 2 } });
  res.json({
    getUser
  });
};
var getDataByParam = (req, res, next) => {
  const { id } = req.params;
  res.json({
    data: id
  });
};
var formDataHandle = (req, res) => {
  try {
    const bodyData = req.body;
    res.json({
      allData: bodyData
    });
  } catch (err) {
  }
};

export {
  signup,
  getData,
  authLogin,
  getDataByParam,
  formDataHandle
};
//# sourceMappingURL=chunk-C6GKSQGS.js.map