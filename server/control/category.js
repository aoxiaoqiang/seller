const CategoryModel = require("../Models/category");
const MenuModel = require("../Models/menu");

const {
  verifyToken
} = require('../middlewares/authHeader');

class Category {
  // 添加分类
  async add(ctx, next) {
    const user = await verifyToken(ctx, next);
    if (!user) return ctx.sendError(401, '请先登录');
    const {
      name,
      desc = '暂无描述'
    } = ctx.request.body;
    if (!name) return ctx.sendError(-1, '参数错误');

    // 添加前检查是否存在
    const [data] = await CategoryModel.find({
      name
    });
    if (data) return ctx.sendError(0, '当前分类已存在, 请勿重复添加');

    // 添加新的分类
    const model = new CategoryModel({
      name,
      desc,
      createTime: new Date(),
      updateTime: new Date()
    });
    const result = await model.save();
    if (result) {
      ctx.send({
        name: result.name,
        desc: result.desc,
        createTime: result.createTime,
        categoryId: result.id
      });
    } else {
      ctx.sendError(-2, '服务器错误');
    }
  }

  // 获取所有分类列表
  async list(ctx, next) {
    const result = await CategoryModel.find();
    if (result) {
      ctx.send({
        list: result.map(item => {
          return {
            id: item.id,
            name: item.name,
            desc: item.desc,
            createTime: item.createTime,
            updateTime: item.updateTime
          }
        }),
        total: result.length
      })
    } else {
      ctx.send({list: []})
    }
  }

  // 删除分类
  async delete(ctx, next) {
    const user = await verifyToken(ctx, next);
    if (!user) return ctx.sendError(401, '请先登录');
    const { id } = ctx.request.body;
    if (!id) return ctx.sendError(-1, '参数错误');

    const result = await CategoryModel.findOne({ _id: id});
    if (result) {
      const mResult = await MenuModel.find({ cid: id });
      if (mResult && mResult.length > 0) {
        return ctx.sendError(0, '当前类目下还有菜品，不可以删除');
      }
      await CategoryModel.deleteOne({ _id: id });
      ctx.send('删除成功');
    } else {
      ctx.sendError(0, '当前分类不存在')
    }
  }

  async update(ctx, next) {
    const user = await verifyToken(ctx, next);
    if (!user) return ctx.sendError(401, '请先登录');
    const { id, name } = ctx.request.body;
    if (!id || !name) return ctx.sendError(-1, '参数错误');

    // 添加前检查是否存在
    const result = await CategoryModel.find({ _id: id });
    if (!result || result.length === 0) return ctx.sendError(0, '当前分类不存在');

    const queryResult = await CategoryModel.find({ name });
    if (queryResult && queryResult.length > 0) return ctx.sendError(0, '当前分类已存在, 勿重复添加');

    const updateResult = await CategoryModel.updateOne({ _id: id }, { name, updateTime: new Date() });
    if (updateResult) {
      ctx.send('更新成功')
    } else {
      ctx.sendError(0, '更新失败')
    }
  }
}


module.exports = new Category();


/*

exports.add = async ctx => {
  if (ctx.session.isNew) {
    // true 就没登录   就不需要就查询数据库
    return (ctx.body = {
      msg: '用户未登录',
      status: 0
    })
  }
  new Category(data).save().then(data => {
    ctx.body = {
      msg: '发表成功',
      status: 1
    }
  })
    .catch(err => {
      ctx.body = {
        msg: '发表失败',
        status: 0
      }
    })
}
exports.delete = async ctx => {
  const _id = ctx.params.id
  let res = {
    state: 1,
    message: '成功'
  }
  await Article.findById(_id)
    .then(data => data.remove())
    .catch(err => {
      res = {
        state: 0,
        message: err
      }
    })

  ctx.body = res
}
exports.update = async ctx => {
  const data = ctx.request.body
  let res = {
    state: 1,
    message: '更新成功'
  }
  Category.update({ _id: data.id }, { $inc: { name: data.name } }, err => {
    if (err) return console.log(err)
    console.log('更新成功')
    ctx.body = res
  })
}

*/
