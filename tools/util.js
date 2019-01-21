/* eslint-disable array-callback-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

/**
 * @summary
 * Get rid of thunks in a given GraphQL type.
 * and return a new type without thunks.
 */
export const getRidOfThunks = (graphQLType) => {
  // Copy object
  const res = Object.assign({}, graphQLType);

  // For each field
  Object.keys(res).map((field) => {
    // If field is a thunk
    if ((typeof res[field]) === 'function') {
      // Execute thunk and assign result to the field
      res[field] = getRidOfThunks(res[field]);
    }
  });

  return res;
};
