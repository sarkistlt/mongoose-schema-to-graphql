import mongoose from 'mongoose';
import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import mongooseSchemaToGraphQL from '../lib/index.min';

import { getRidOfThunks } from '../tools/util';

test('generates schemas with primitive arrays correctly', () => {
  const NAME = 'ArrayTestSchema';
  const DESCRIPTION = 'Testing';

  const Schema = new mongoose.Schema({
    something: String,
    whatever: [String],
  });

  const ExpectedType = getRidOfThunks(
    mongooseSchemaToGraphQL({
      name: NAME,
      class: 'GraphQLObjectType',
      description: DESCRIPTION,
      schema: Schema,
      exclude: ['_id'],
    }),
  );

  const ReceivedType = getRidOfThunks(
    (new GraphQLObjectType({
      name: NAME,
      description: DESCRIPTION,
      fields: () => ({
        something: { type: GraphQLString },
        whatever: { type: new GraphQLList(GraphQLString) },
      }),
    })),
  );

  expect(ExpectedType).toEqual(ReceivedType);
});
