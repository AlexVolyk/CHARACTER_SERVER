const router = require('express').Router();
const {UserModel} = require('../models'); // * here we get user model
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
// const validateJWT = require('../middleware/validate-session');


router.post('/register', async (req, res) => {
    let {email, 
        password,  
        username
    } = req.body.user; //? and maybe here we use user model too (because in models in the user.js we do this const User = db.define('user', {..}, it's mean that we create User only if request have { "user": {password: "", email: "", username: ""} }   )
    // ? req.body.user destruction ↑↑↑↑↑↑↑↑ (object destruction)
    
    try { //* here we use user model
        //* because we need it like a templet for creating a user
        let User = await UserModel.create({
            email,
            password: bcrypt.hashSync(password, 7),
            username
        });
        // ? Here we create token ↓↓↓↓ (For token creating we use users id, JWT_SECRET from .evn file and the last is token lifetime {{expiresIn: 60 * 60 * 24} - first number - seconds, second number - minutes, third number - hours})
        // * token using for access to the other data requests from the server
        let token = jwt.sign({id: User.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24})
        res.status(201).json({
            message: "User successfully registered",
            user: User,
            sessionToken: token
        })
    } catch (err) {
        res.status(500).json({
            message: `Failes to register user ${err}`
        })
    }
});


// Login
                //, validateJWT (second var in the next line maybe)
router.post("/login", async (req, res) => {
    const { email, password } = req.body.user;
    try {
        let loginUser = await UserModel.findOne({
            where: {
                email: email
            }
        });


        if (loginUser) {

        let passwordHashComprasion = await bcrypt.compare(password, loginUser.password);

            if(passwordHashComprasion) {
                // ? here we create token one more time ↓↓↓↓
                let token = jwt.sign({id: loginUser.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});
                
                res.status(200).json({
                    user: loginUser,
                    message: "User successfully logged in",
                    sessionToken: token
                });
            } else {
                res.status(401).json({
                    message: "User not authorized"
                })
            }
        } else {
            res.status(401).json({
                message: 'Incorrect email or password'
            });
        }
        
    } catch (err) {
        res.status(500).json({
            message: `Failed to login ${err}`
        })
    }
});

module.exports = router;