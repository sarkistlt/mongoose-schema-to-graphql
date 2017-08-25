import mongoose from 'mongoose';
import { GraphQLObjectType, GraphQLString } from 'graphql';
import mongooseSchemaToGraphQL from '../lib/index.min';

import { getRidOfThunks } from '../tools/util';

test('generates flat schema correctly', () => {
  const NAME = 'FlatTestSchema';
  const DESCRIPTION = 'Testing';

  const ExpectedType = getRidOfThunks(mongooseSchemaToGraphQL({
    name: NAME,
    class: 'GraphQLObjectType',
    description: DESCRIPTION,
    schema: new mongoose.Schema({
      something: String,
      whatever: String,
    }),
    exclude: ['_id'],
  }));

  const ReceivedType = getRidOfThunks(new GraphQLObjectType({
    name: NAME,
    description: DESCRIPTION,
    fields: () => ({
      something: { type: GraphQLString },
      whatever: { type: GraphQLString },
    }),
  }));

  expect(ExpectedType).toEqual(ReceivedType);
});
