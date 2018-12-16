'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateDescriptionForSubField = exports.generateNameForSubField = undefined;

var _graphql = require('graphql');

var _graphqlIsoDate = require('graphql-iso-date');

var possibleGraphQLClasses = {
  GraphQLObjectType: _graphql.GraphQLObjectType,
  GraphQLInputObjectType: _graphql.GraphQLInputObjectType,
  GraphQLInterfaceType: _graphql.GraphQLInterfaceType,
  GraphQLUnionType: _graphql.GraphQLUnionType,
  GraphQLEnumType: _graphql.GraphQLEnumType,
  GraphQLDateTime: _graphqlIsoDate.GraphQLDateTime,
  GraphQLID: _graphql.GraphQLID
};

/**
 * @summary Set the function name property.
 */
var setFnName = function setFnName(fn, name) {
  return Object.defineProperty(fn, 'name', { value: name });
};

var generateNameForSubField = exports.generateNameForSubField = function generateNameForSubField(rootTypeName, subFieldKeyName) {
  return `${rootTypeName}_${subFieldKeyName}`;
};

var generateDescriptionForSubField = exports.generateDescriptionForSubField = function generateDescriptionForSubField(rootTypeName, subFieldKeyName) {
  return `${rootTypeName}'s '${subFieldKeyName}' sub-field`;
};

/**
 * @summary
 * Convert the primitive object Mongoose instance
 * name to the GraphQL type instance.
 */
var convertPrimitiveObjectInstanceToGraphQLType = function convertPrimitiveObjectInstanceToGraphQLType(instanceName) {
  switch (instanceName) {
    case 'ObjectID':
      return _graphql.GraphQLID;
    case 'String':
    case 'Mixed':
      return _graphql.GraphQLString;
    case 'Date':
      return _graphqlIsoDate.GraphQLDateTime;
    case 'Boolean':
    case 'Buffer':
      return _graphql.GraphQLBoolean;
    case 'Number':
      return _graphql.GraphQLInt;
    default:
      throw new Error(`unknown primitive object instance name: "${instanceName}"`);
  }
};

/**
 * @summary
 * Generate the GraphQL type using given GraphQL type class
 * and the configuration for that type class.
 */
var generateGraphQLType = function generateGraphQLType(typeClass, config) {
  return new possibleGraphQLClasses[typeClass](config);
};

/**
 * @summary
 * Check passed arguments for errors.
 */
var checkArgsForErrors = function checkArgsForErrors(args) {
  if (!args) {
    throw new Error('options are required');
  }

  if (!args.schema) {
    throw new Error('`schema` option *should* be provided');
  }

  if (!args.schema.paths) {
    throw new Error('`schema` option should be a valid mongoose.Schema instance');
  }

  if (!args.name) {
    throw new Error('`name` option *should* be provided');
  }

  if (!args.class) {
    throw new Error('`class` option is required');
  }

  if (Object.keys(possibleGraphQLClasses).indexOf(args.class) === -1) {
    throw new Error('invalid `class` option specified');
  }
};

/**
 * @summary
 * Parse given arguments object.
 */
var parseArgs = function parseArgs(args) {
  checkArgsForErrors(args);
  var res = args;
  res.exclude = args.exclude || [];
  res.extend = args.extend || {};
  res.props = args.props || {};
  return res;
};

/**
 * @summary
 * The already-generated types memory.
 */
var generatedTypesMemory = {};

/**
 * @summary
 * Memoize given type with a given name.
 */
var memoize = function memoize(name, resultingGraphQLType) {
  if (generatedTypesMemory[name]) {
    throw new Error('attempt to create GraphQL type with already existing name');
  }

  generatedTypesMemory[name] = resultingGraphQLType;
};

/**
 * @summary Retrieve type from the memory by name.
 */
var getFromMemory = function getFromMemory(name) {
  return generatedTypesMemory[name];
};

function createType(args) {
  var parsedArgs = parseArgs(args);

  // Check if this type is already memoized
  var alreadyGeneratedType = getFromMemory(parsedArgs.name);
  if (alreadyGeneratedType) return alreadyGeneratedType;

  // The resulting object which would be passed to the
  // constructor of the new GraphQL type.
  var resultingGraphQLOptions = {
    name: parsedArgs.name,
    description: parsedArgs.description,
    fields: function fields() {
      return {};
    }
  };

  // The resulting GraphQL type.
  var resultingGraphQLType = null;

  var rootSchemaPaths = parsedArgs.schema.paths;

  var setResultingTypeField = function setResultingTypeField(key, val) {
    var oldFields = resultingGraphQLOptions.fields;
    resultingGraphQLOptions.fields = function () {
      return Object.assign({}, oldFields(), { [key]: val });
    };
  };

  var setResultingTypeFieldFn = function setResultingTypeFieldFn(key, val) {
    var oldFields = resultingGraphQLOptions.fields;
    resultingGraphQLOptions.fields = function () {
      return Object.assign({}, oldFields(), { [key]: val() });
    };
  };

  var extendResultingTypeField = function extendResultingTypeField(newFields) {
    var oldFields = resultingGraphQLOptions.fields;
    resultingGraphQLOptions.fields = function () {
      return Object.assign({}, oldFields(), typeof newFields === 'function' ? newFields() : newFields);
    };
  };

  Object.keys(rootSchemaPaths).filter(function (pathName) {
    // If "exclude" is a Regular Expression, make sure that
    // fields do not match that expression
    if (parsedArgs.exclude instanceof RegExp) {
      return !parsedArgs.exclude.test(pathName);
    }

    // Otherwise, assume "exclude" is an array of strings
    return parsedArgs.exclude.indexOf(pathName) === -1;
  }).map(function (pathName) {
    var path = rootSchemaPaths[pathName];

    // If path points to another object
    // (this is called "population" in Mongoose)
    if (path.caster && path.caster.options && path.caster.options.ref && getFromMemory(path.caster.options.ref)) {
      // Get the type of the pointer
      var refTypeName = path.caster.options.ref;

      setResultingTypeFieldFn(pathName, function () {
        // Get the type from the memory
        var refGraphQLType = getFromMemory(refTypeName);

        if (!refGraphQLType) {
          throw new Error(`
type with name "${refTypeName}" doesn't exist,
but was specified as population reference.
*NOTE*: This error was thrown while creating "${parsedArgs.name}" GraphQL type.
`);
        }

        return {
          type: refGraphQLType
        };
      });

      // Go to the next path
      return;
    }

    var pathInstanceName = path.instance;

    // If the field represents another user-defined schema
    if (pathInstanceName === 'Embedded') {
      if (parsedArgs.schema === path.schema) {
        setResultingTypeFieldFn(pathName, function () {
          return {
            type: resultingGraphQLType
          };
        });
      } else {
        setResultingTypeField(pathName, {
          type: createType({
            name: generateNameForSubField(resultingGraphQLOptions.name, pathName),
            description: generateDescriptionForSubField(resultingGraphQLOptions.name, pathName),
            class: parsedArgs.class,
            schema: path.schema,
            exclude: parsedArgs.exclude
          })
        });
      }

      // Go to the next path
      return;
    }

    // If the field represents an array
    if (pathInstanceName === 'Array') {
      if (path.schema) {
        // This is the array which contains other user-defined schema
        if (parsedArgs.schema === path.schema) {
          // If the array contains the same type.
          setResultingTypeFieldFn(pathName, function () {
            return {
              type: new _graphql.GraphQLList(resultingGraphQLType)
            };
          });
        } else {
          setResultingTypeField(pathName, {
            type: new _graphql.GraphQLList(createType({
              name: generateNameForSubField(resultingGraphQLOptions.name, pathName),
              description: generateDescriptionForSubField(resultingGraphQLOptions.name, pathName),
              class: parsedArgs.class,
              schema: path.schema,
              exclude: parsedArgs.exclude
            }))
          });
        }
      } else {
        var arrayElementInstanceName = path.caster.instance;
        var resType = new _graphql.GraphQLList(convertPrimitiveObjectInstanceToGraphQLType(arrayElementInstanceName));

        setResultingTypeField(pathName, { type: resType });
      }

      // Go to the next path
      return;
    }

    // If we are reached this point, that means that
    // the field is of a primitive type.
    setResultingTypeField(pathName, { type: convertPrimitiveObjectInstanceToGraphQLType(pathInstanceName) });
  });

  // Extend the resulting type configuration with the given fields
  extendResultingTypeField(parsedArgs.extend);
  extendResultingTypeField(parsedArgs.props);

  setFnName(resultingGraphQLOptions.fields, 'fields');

  resultingGraphQLType = generateGraphQLType(parsedArgs.class, resultingGraphQLOptions);

  // Memoize
  memoize(parsedArgs.name, resultingGraphQLType);
  return resultingGraphQLType;
}

exports = module.exports = createType;
exports.generateNameForSubField = generateNameForSubField;
exports.generateDescriptionForSubField = generateDescriptionForSubField;

//# sourceMappingURL=index.js.map