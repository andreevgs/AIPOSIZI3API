const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const DB_ACCESS_LINK = require('../config').DB_ACCESS_LINK;

const sequelize = new Sequelize(DB_ACCESS_LINK);

const User = sequelize.define('users', {
    username: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    }
});

User.prototype.validPassword = function (password){
    return bcrypt.compareSync(password, this.password);
} 

sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

module.exports = User;