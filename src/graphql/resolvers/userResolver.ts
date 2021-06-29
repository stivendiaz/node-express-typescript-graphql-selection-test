import { UserInputError } from 'apollo-server-express';
import * as dotenv from 'dotenv';

import { UserModel } from '../../models/userModel';

dotenv.config();

/**
 * resolver for the user schema, this also handles some JWT logic
 */
const UserResolver = {
  Query: {
    /**
     * This returns the user entire user list
     * @return All user list
     */
    async getAll() {
      const userModel = await UserModel.find({});
      return userModel;
    },
    /**
     * This returns the user entire user list
     * @return All user list
     */
    async filterBy(_, {name, field, order}: { name: string, field: string, order: string }) {

      const query = name ? {name: { $regex: name, $options: "i" }} : {};

      const userModel = await UserModel.find(query).sort({ [field]: order});
      return userModel;
    },
  },
  Mutation: {
    /**
     * creates a new user with the given information
     * @param username
     * @param name
     * @param age
     * @return the user just created
     */
    async signup(_, { username, name, age }: { username: string, name: string, age: number }) {
      const user = new UserModel({
        username,
        name,
        age,
      });
      try {
        return await user.save();
      } catch (error) {
        throw new UserInputError(error);
      }
    },
    /**
     * delete a user by userId
     * @param userId
     * @return the user just deleted
     */
    async deleteUserById(_, { userId }: { userId: string }) {
      try {
        const user = await UserModel.findOne({_id: userId});
        if(user !== null ) {
          await UserModel.deleteOne({_id: userId});
          return user;
        } else {
          throw new UserInputError("this id doesn't exist");
        }
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  },
};

export default UserResolver;
