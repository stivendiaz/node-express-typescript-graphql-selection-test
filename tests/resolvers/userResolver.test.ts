/* eslint-disable no-unused-vars */
import { mergeTypeDefs } from '@graphql-tools/merge';
import EasyGraphQLTester from 'easygraphql-tester';

import * as dotenv from 'dotenv';
import * as dbHandler from '../dbHandler';
import { fillDB } from '../../src/scripts/fillDatabase';
import user from '../../src/graphql/schemas/user.graphql';
import userResolver from '../../src/graphql/resolvers/userResolver';
import { UserModel } from '../../src/models/userModel';

dotenv.config();

const schema = mergeTypeDefs([user], { useSchemaDefinition: true, forceSchemaDefinition: true });

let tester = null;
beforeAll(async () => {
  dbHandler.connect();
  tester = new EasyGraphQLTester(schema, userResolver);
});
afterEach(async () => dbHandler.clearDatabase());
afterAll(async () => dbHandler.closeDatabase());

describe('test mutations', () => {
  afterEach(async () => dbHandler.clearDatabase());

  test('test signup', async () => {
    const mutation = `
      mutation signup($username: String!, $name: String!, $age: Int!) {
        signup(username: $username, name: $name, age: $age){
          id
        }
      }
    `;

    tester.test(true, mutation, {
      username: 'username',
      name: 'Pepito Perez',
      age: 18,
    });

    const result = await tester.graphql(mutation, {}, {}, {
        username: 'username',
        name: 'Pepito Perez',
        age: 18,
      }
    );
    expect(result.data.signup.length).not.toBeNull();
  });

  test('test deleteUserById happy path', async () => {
    // Arrange
    const user = new UserModel({
      username: 'username',
      name: 'Pepito Perez',
      age: 18,
    });

    const resultado = await user.save();

    const mutation = `
      mutation deleteUserById($userId: String!) {
        deleteUserById(userId: $userId){
          id,
          username,
          name,
          age
        }
      }
    `;

    // Act
    tester.test(true, mutation, {
      userId: resultado._id.toString(),
    });

    const result = await tester.graphql(mutation, {}, {}, {
        userId: resultado._id.toString()
      }
    );

    // Assert
    const resp = await UserModel.find({});
    expect(result.errors).toBe(undefined);
    expect(result.data.deleteUserById.username).toBe(user.username);
    expect(resp.length).toEqual(0);
  });

  test('test deleteUserById when user doesnt exist', async () => {
    // Arrange
    const mutation = `
      mutation deleteUserById($userId: String!) {
        deleteUserById(userId: $userId){
          id,
          username,
          name,
          age
        }
      }
    `;

    // Act
    tester.test(true, mutation, {
      userId: '60d97cf7d5385f3b849c8c36',
    });

    const result = await tester.graphql(mutation, {}, {}, {
        userId: '60d97cf7d5385f3b849c8c36'
      }
    );

    // Assert
    expect(result.errors).not.toBe(undefined);
    expect(result.errors[0].message).toBe("this id doesn't exist");
  });
});

describe('test queries', () => {
  let users

  beforeEach(async () => {
    users = await fillDB(1);
  });

  test('test getAll users query', async () => {

    const query = `
      query TEST {
        getAll {
          username
        }
      }`;

    const result = await tester.graphql(query, undefined, {});
    expect(result.errors).toBe(undefined);
    expect(result.data.getAll).not.toBe(undefined);
    expect(result.data.getAll[0].username.toString()).toEqual(users[0].username.toString());
    expect(result.data.getAll.length).toEqual(1);
  });

  test('test filterBy users query', async () => {

    const query = `
        query TEST($name: String!, $field: String!, $order: String!) {
          filterBy(name: $name, field: $field, order: $order){
            id
          }
        }`;

    const result = await tester.graphql(query, undefined, undefined, {
      name: '',
      field: 'username',
      order: 'desc',
    });
    expect(result.errors).toBe(undefined);
    expect(result.data.filterBy).not.toBe(undefined);
  });
});
