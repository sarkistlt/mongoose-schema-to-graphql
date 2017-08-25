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

test('memoizes created types', () => {
  const NAME = 'ExtendTestSchema';
  const DESCRIPTION = 'Testing';

  const opts = {
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
  };

  expect(mongooseSchemaToGraphQL(opts)).toBe(mongooseSchemaToGraphQL(opts));
});
