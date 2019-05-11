const bcrypt = require('bcryptjs');

const User = require('../../models/users')

module.exports = {
  createUser: async args => {
    try {
      const existingUser = await User.findOne({
        email: args.userInput.email,
      })
      if(existingUser) {
        throw new Error('User already exist')
      }
      const hashpassword = await bcrypt.hash(args.userInput.password, 12)
      const user = new User({
        email: args.userInput.email,
        password: hashpassword
      })
      const result = await user.save()
      return { 
        ...result._doc, 
        password: null, 
        _id: result.id 
      }
    } catch(err) {
        console.log(err);
        throw err;
    }
  },
}
