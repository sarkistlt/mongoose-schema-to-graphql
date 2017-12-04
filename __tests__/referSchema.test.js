import mongoose from 'mongoose';
import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import mongooseSchemaToGraphQL, {
  generateDescriptionForSubField,
  generateNameForSubField,
} from '../lib/index.min';

import { getRidOfThunks } from '../tools/util';

test('generates nested schema correctly', () => {
  const NAME = 'NestedTestSchema';
  const DESCRIPTION = 'Testing';

  const MuscleSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
  });
  const MuscleType = mongooseSchemaToGraphQL({
    name: 'MuscleSchema',
    class: 'GraphQLObjectType',
    description: DESCRIPTION,
    schema: MuscleSchema,
  });

  mongoose.model('Muscle', MuscleSchema);

  const Schema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    muscules: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Muscle',
    }],
  });

  const ReceivedType = getRidOfThunks(mongooseSchemaToGraphQL({
    name: NAME,
    class: 'GraphQLObjectType',
    description: DESCRIPTION,
    schema: Schema,
    exclude: ['_id'],
    extend: {
      muscules: {
        type: new GraphQLList(MuscleType),
        resolve() {},
      },
    },
  }));

  const ExpectedType = getRidOfThunks(new GraphQLObjectType({
    name: NAME,
    description: DESCRIPTION,
    fields: () => ({
      name: { type: GraphQLString },
      muscules: { type: new GraphQLList(MuscleType) },
    }),
  }));

  expect(JSON.stringify(ExpectedType)).toEqual(JSON.stringify(ReceivedType));
});
