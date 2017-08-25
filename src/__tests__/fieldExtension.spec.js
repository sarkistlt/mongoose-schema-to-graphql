import mongoose from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
} from 'graphql';

import mongooseSchemaToGraphQL, {
  generateNameForSubField,
  generateDescriptionForSubField,
} from '..';

import {
  getRidOfThunks,
} from './util';

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
        b: {type: GraphQLString},
      },
      exclude: ['_id'],
    })),
  ).toEqual(
    getRidOfThunks(new GraphQLObjectType({
      name: NAME,
      description: DESCRIPTION,
      fields: () => ({
        a: {type: GraphQLInt},
        b: {type: GraphQLString},
      }),
    })),
  );
});
