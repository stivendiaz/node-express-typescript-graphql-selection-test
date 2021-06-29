import faker from 'faker';
import { UserModel } from '../models/userModel';

export const fillDB = async (num: number) => {
  const models = [];
  for (let i = 0; i < num; i += 1) {
    const user = new UserModel({
      username: faker.internet.userName(),
      name: faker.name.findName(),
      age: Math.floor(Math.random() * 60) + 18,
    });
    await user.save();
    models.push(user);
  }
  return models;
};

export const validatePrepopulate = async () => {
  const users = await UserModel.find();
  if(users.length < 3) {
    fillDB(3);
  }
}
