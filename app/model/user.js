/**
 * Created by Administrator on 2016/6/3.
 */
function User(user) {
    this.id = user.id;
    this.token = user.token;
    this.nickname = user.nickname;
    this.avatar = user.avatar;
}
module.exports = User;