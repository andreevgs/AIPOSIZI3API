const User = require('../models/user');
const axios = require('axios');
let jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

exports.signup = (req, res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })
    .then(user => {
      res.send({ message: "User was registered successfully!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      if (!user.validPassword(req.body.password)) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
        expiresIn: 86400
      });

      res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken: token
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.google = async (req, res) => {

    console.log('google body: ', req.body);
    const { tokenId }  = req.body;
    const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.CLIENT_ID
    });
    const object = ticket.getPayload();
    console.log('object: ', object);


    let user = await User.findOne({ 
        where: { email: object.email },
    });

    if(user){
        await User.update({
            email: object.email,
            username: object.name
        }, {
            where: {
                email: object.email
            }
        });
    }
    else {
        user = await User.create({
            email: object.email,
            username: object.name,
            password: object.at_hash
        });
    }

    let token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
        expiresIn: 86400
    });

    res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken: token
    });
};

exports.facebook = async (req, res) => {
    let object = req.body;
    axios.get(`https://graph.facebook.com/me`, { headers: { Authorization: 'token ' + object.accessToken }, params: {
        fields: ['id', 'email', 'first_name', 'last_name'].join(','),
        access_token: object.accessToken,
    }})
        .then(async (getUserInfo) => {
            console.log('getUserInfo: ', getUserInfo);
            let user = await User.findOne({ 
                where: { email: getUserInfo.data.email },
            });
        
            if(user){
                await User.update({
                    email: getUserInfo.data.email,
                    username: getUserInfo.data.name
                }, {
                    where: {
                        email: getUserInfo.data.email
                    }
                });
            }
            else {
                user = await User.create({
                    email: getUserInfo.data.email,
                    username: getUserInfo.data.name,
                    password: object.accessToken
                });
            }
        
            let token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
                expiresIn: 86400
            });
        
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                accessToken: token
            });
        })
        .catch(err => {
            console.log('err2: ', err);
            res.status(500).json({ message: 'err' });
        });
    
};

exports.github = async (req, res) => {

    const body = {
        client_id: 'fd45f818de6c1865baf0',
        client_secret: '3b8fa5769fccec320e579659c6e6ef46ac47e3ec',
        code: req.body.code
    };
    const opts = { headers: { accept: 'application/json' } };
    let opts_get;

    axios.post(`https://github.com/login/oauth/access_token`, body, opts).
    then((getToken) => {
        console.log('My data: ', getToken.data.access_token);
        axios.get(`https://api.github.com/user`, { headers: { Authorization: 'token ' + getToken.data.access_token }}).
        then(async (getUserInfo) => {
            console.log('My data 2: ', getUserInfo);

            let user = await User.findOne({ 
                where: { username: getUserInfo.data.login },
            });
        
            if(user){
                await User.update({
                    email: getUserInfo.data.login,
                    username: getUserInfo.data.login
                }, {
                    where: {
                        username: getUserInfo.data.login,
                        email: getUserInfo.data.login
                    }
                });
            }
            else {
                user = await User.create({
                    email: getUserInfo.data.login,
                    username: getUserInfo.data.login,
                    password: getToken.data.access_token
                });
            }
        
            let token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
                expiresIn: 86400
            });
        
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                accessToken: token
            });
        })
        .catch(err => {
            console.log('err2: ', err);
            res.status(500).json({ message: 'err' });
        });
    }).
    catch((err) => {
        console.log('err1: ', err);
        res.status(500).json({ message: 'err' });
    });    
};