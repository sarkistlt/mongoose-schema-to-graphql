/**
 * @summary
 * Get rid of thunks in a given GraphQL type.
 * and return a new type without thunks.
 */
export const getRidOfThunks = (graphQLType) => {
  // Copy object
  const res = Object.assign({}, graphQLType);

  // Retrieve the fields
  res._typeConfig.fields = res._typeConfig.fields();

  // For each field
  Object.keys(res._typeConfig.fields).map((field) => {
    // If field is a thunk
    if ((typeof res._typeConfig.fields[field]) === 'function') {
      // Execute thunk and assign result to the field
      res._typeConfig.fields[field] = getRidOfThunks(res._typeConfig);
    }
  });

  return res;
};

export default {
  getRidOfThunks,
};
