var baseModel = {
    statics: {
        //KeyValue是一个JSON对象，可以根据需求自由传入
        findByKeyValue: function (obj, data) {
            return this.find(obj).exec(data);
        },
        Find: function (query, data) {
            if (!query.limit) {
                query.limit = 1000;
            }
            if (!query.order) {
                query.order = "-createdAt";
            }
            if (!query.include) {
                query.include = "";
            }
            return this.find(query.where).populate(query.include).limit(query.limit).sort(query.order).exec(data);
        },
        Update: function (query, data) {
            query.data.updatedAt = Date.now();  //所有更新操作，都更新系统updatedAt字段
            return this.update({_id: query._id}, query.data).exec(data);
        }
    }
};

module.exports = baseModel;