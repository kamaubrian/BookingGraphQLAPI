const User = require('../../../api/model/user');
const bcyrpt = require('bcryptjs');

module.exports = {
    createUser: (args) => {
        return User.findOne({email: args.userInput.email})
            .then(user => {
                if (user) {
                    throw new Error('User Already Exists')
                } else {
                    return bcyrpt.hash(args.userInput.password, 12)
                        .then(hashedPassword => {
                            const user = new User({
                                email: args.userInput.email,
                                password: hashedPassword
                            });
                            return user.save()
                                .then(result => {
                                    return {
                                        ...result._doc, _id: result.id,
                                        password: null
                                    }
                                })
                                .catch(err => {
                                    console.log(err.message);
                                    throw err;
                                });
                        })
                        .catch(err => {
                            console.log(err.message);
                            throw err;

                        });
                }
            })
            .catch(err => {
                console.log('Error Fetching Users', err.message);
                throw err;
            })

    },
    login: async ({email, password}) => {
        const user = await User.findOne({email: email});
        if (!user) {
            throw new Error('User Does not Exists')
        }
        const isPasswordSimilar = await bcyrpt.compare(password,user.password);
        if(!isPasswordSimilar){
            throw new Error('Password Is Incorrect');
        }
    }

}