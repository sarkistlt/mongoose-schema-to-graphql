import mongoose from 'mongoose';
import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import mongooseSchemaToGraphQL from '../lib/index.min';
import { getRidOfThunks } from '../tools/util';

test('generates schemas with arrays which contain the same schema correctly', () => {
  const NAME = 'RecursiveArrayTestType';
  const DESCRIPTION = 'Testing';

  const Schema = new mongoose.Schema({
    something: String,
  });

  Schema.add({
    whatever: [Schema],
  });

  const ReceivedType = getRidOfThunks(mongooseSchemaToGraphQL({
    name: NAME,
    class: 'GraphQLObjectType',
    description: DESCRIPTION,
    schema: Schema,
    exclude: ['_id'],
  }));

  let ExpectedType = new GraphQLObjectType({
    name: NAME,
    description: DESCRIPTION,
    fields: () => ({
      something: { type: GraphQLString },
      whatever: { type: new GraphQLList(ExpectedType) },
    }),
  });
  ExpectedType = getRidOfThunks(ExpectedType);

  expect(ReceivedType).toEqual(ExpectedType);
});
