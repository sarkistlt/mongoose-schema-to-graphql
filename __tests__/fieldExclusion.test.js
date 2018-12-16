import mongoose from 'mongoose';
import { GraphQLID, GraphQLInt, GraphQLObjectType } from 'graphql';
import mongooseSchemaToGraphQL from '../lib/index.min';

import { getRidOfThunks } from '../tools/util';

test('excludes given fields', () => {
  const NAME = 'ExcludeTestSchema';
  const DESCRIPTION = 'Testing';

  expect(
    getRidOfThunks(mongooseSchemaToGraphQL({
      name: NAME,
      class: 'GraphQLObjectType',
      description: DESCRIPTION,
      schema: new mongoose.Schema({
        a: Number,
        b: String,
      }),
      exclude: ['_id', 'b'],
    })),
  ).toEqual(
    getRidOfThunks(new GraphQLObjectType({
      name: NAME,
      description: DESCRIPTION,
      fields: () => ({
        a: { type: GraphQLInt },
      }),
    })),
  );

  const NAME2 = 'NAME2';
  expect(
    getRidOfThunks(mongooseSchemaToGraphQL({
      name: NAME2,
      class: 'GraphQLObjectType',
      description: DESCRIPTION,
      schema: new mongoose.Schema({
        __custom: String,
        __v: String,
        a: Number,
      }),
      exclude: /^__/,
    })),
  ).toEqual(
    getRidOfThunks(new GraphQLObjectType({
      name: NAME2,
      description: DESCRIPTION,
      fields: () => ({
        _id: { type: GraphQLID },
        a: { type: GraphQLInt },
      }),
    })),
  );
});
