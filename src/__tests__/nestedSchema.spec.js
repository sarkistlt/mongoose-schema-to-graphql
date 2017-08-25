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

test('generates nested schema correctly', () => {
  const NAME = 'NestedTestSchema';
  const DESCRIPTION = 'Testing';

  const WhateverSchema = new mongoose.Schema({
    a: String,
    b: String,
  });

  const Schema = new mongoose.Schema({
    whatever: WhateverSchema,
  });

  const ReceivedType = getRidOfThunks(mongooseSchemaToGraphQL({
    name: NAME,
    class: 'GraphQLObjectType',
    description: DESCRIPTION,
    schema: Schema,
    exclude: ['_id'],
  }));

  const ExpectedType = getRidOfThunks(new GraphQLObjectType({
    name: NAME,
    description: DESCRIPTION,
    fields: () => ({
      whatever: {
        type: new GraphQLObjectType({
          name: generateNameForSubField(NAME, 'whatever'),
          description: generateDescriptionForSubField(NAME, 'whatever'),
          fields: () => ({
            a: {type: GraphQLString},
            b: {type: GraphQLString},
          })
        }),
      },
    }),
  }));

  expect(ReceivedType).toEqual(ExpectedType);
});
