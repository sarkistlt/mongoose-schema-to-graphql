import mongoose from 'mongoose';
import { GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql';
import mongooseSchemaToGraphQL from '../lib/index.min';

import { getRidOfThunks } from '../tools/util';

test('adds given fields with `extend` property', () => {
  const NAME = 'ExtendTestSchema';
  const DESCRIPTION = 'Testing';

  expect(
    getRidOfThunks(mongooseSchemaToGraphQL({
      name: NAME,
      class: 'GraphQLObjectType',
      description: DESCRIPTION,
      schema: new mongoose.Schema({
        a: Number,
      }),
      extend: {
        b: { type: GraphQLString },
      },
      exclude: ['_id'],
    })),
  ).toEqual(
    getRidOfThunks(new GraphQLObjectType({
      name: NAME,
      description: DESCRIPTION,
      fields: () => ({
        a: { type: GraphQLInt },
        b: { type: GraphQLString },
      }),
    })),
  );
});
