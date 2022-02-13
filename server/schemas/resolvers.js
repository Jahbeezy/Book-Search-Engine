const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models/User');
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context ) =>{
            if(context.user){
                const results = await User.findOne({_id: context.user._id}).select(
                    '-__v -password'
                )
                return results
            }
            throw new AuthenticationError("Log in First!")
        }
    },
    Mutation: {
        addUser: async (parent, args, context)=>{
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user }
        },
        login: async (parent,{email, password}, context) => {
            const user = await User.findOne({ email });
            if(!user){
                throw new AuthenticationError("Error no email found")
            }
            const passCheck = await user.isCorrectPassword(password)

            if(!passCheck){
                throw new AuthenticationError('Password is incorrect')
            }
            const token = signToken(user);
            return {token, user};

        },
        savedBooks: async (parent, { newBook }, context) =>{
            if(context.user){
                const update = User.findByIdAndUpdate(
                    {_id: context.user._id},
                    { $push : {savedBooks:  newBook }},
                    { new: true }
                )
                return update;
            }
            throw new AuthenticationError('Log in First!')
        },
        removeBook: async (parent, { bookId }, context) =>{
            if(context.user){
                const update = User.findByIdAndUpdate(
                    {_id: context.user._id},
                    { $pull : {savedBooks: { bookId }}},
                    { new: true }
                )
                return update;
            }
            throw new AuthenticationError('Log in First!')
        },
    },

}

module.exports = resolvers;