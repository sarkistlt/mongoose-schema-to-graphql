import mongoose from 'mongoose';
import { GraphQLObjectType, GraphQLString } from 'graphql';
import mongooseSchemaToGraphQL from '../lib/index.min';

import { getRidOfThunks } from '../tools/util';

test('generates schemas which contain field with the same schema correctly', () => {
  const NAME = 'RecursiveTestSchema';
  const DESCRIPTION = 'Testing';

  const Schema = new mongoose.Schema({
    something: String,
  });

  Schema.add({
    whatever: Schema,
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
      whatever: { type: ExpectedType },
    }),
  });
  ExpectedType = getRidOfThunks(ExpectedType);

  expect(ReceivedType).toEqual(ExpectedType);
});
