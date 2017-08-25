import mongoose from 'mongoose';
import { GraphQLObjectType } from 'graphql';
import mongooseSchemaToGraphQL from '../lib/index.min';

import { getRidOfThunks } from '../tools/util';

test('generates schemas with population usage correctly', () => {
  const NAME = 'RecursiveTestSchema';
  const DESCRIPTION = 'Testing';

  const NothingSchema = new mongoose.Schema({
    something: String,
  });

  const NothingType = mongooseSchemaToGraphQL({
    name: 'Nothing',
    description: 'just just',
    schema: NothingSchema,
    class: 'GraphQLObjectType',
  });

  const Schema = new mongoose.Schema({
    whatever: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Nothing',
    }],
  });

  const ExpectedType = getRidOfThunks(new GraphQLObjectType({
    name: NAME,
    description: DESCRIPTION,
    fields: () => ({
      whatever: { type: NothingType },
    }),
  }));

  const ReceivedType = getRidOfThunks(mongooseSchemaToGraphQL({
    name: NAME,
    class: 'GraphQLObjectType',
    description: DESCRIPTION,
    schema: Schema,
    exclude: ['_id'],
  }));

  expect(ReceivedType).toEqual(ExpectedType);
});
