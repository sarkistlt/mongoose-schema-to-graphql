import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';

const randomName = (len) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const mapToObject = (mainObj, prop, instance) => {
  switch (instance) {
    case 'ObjectID':
      mainObj[prop] = { type: GraphQLString };
      break;
    case 'String':
      mainObj[prop] = { type: GraphQLString };
      break;
    case 'Date':
      mainObj[prop] = { type: GraphQLString };
      break;
    case 'Mixed':
      mainObj[prop] = { type: GraphQLString };
      break;
    case 'Boolean':
      mainObj[prop] = { type: GraphQLBoolean };
      break;
    case 'Buffer':
      mainObj[prop] = { type: GraphQLBoolean };
      break;
    case 'Number':
      mainObj[prop] = { type: GraphQLInt };
      break;
    case 'Array':
      mainObj[prop] = { type: new GraphQLList(GraphQLString) };
      break;
  }
  return mainObj;
};

function createType(args) {
  if (args.schema && args.schema.paths) {
    let fields = {};
    const GQLS = {
      name: args.name,
      description: args.description,
      fields: () => Object.assigh({}, fields, args.extend),
    };
    const tmpArgsObj = { ...args.schema.paths };
    const newSchemaObject = {};
    const noChildSchema = {};

    for (const key in tmpArgsObj) {
      if (tmpArgsObj[key].hasOwnProperty('schema')) {
        newSchemaObject[key] = tmpArgsObj[key];
        tmpArgsObj[key] = {};
      }
    }
    for (const key in tmpArgsObj) {
      if (tmpArgsObj.hasOwnProperty(key) && !tmpArgsObj[key].schema) {
        noChildSchema[key] = tmpArgsObj[key];
      }
    }
    Object.keys(noChildSchema).forEach((k) => {
      if (!noChildSchema[k].hasOwnProperty('schema')) {
        const path = k.split('.');
        const last = path.pop();

        if (path.length) {
          path.reduce((r, a) => r[a] = r[a] || {}, noChildSchema)[last] = noChildSchema[k];
          path.reduce((r, a) => r[a] = r[a] || {}, noChildSchema)[last].path = last;
          delete noChildSchema[k];
        }
      }
    });
    for (const key in noChildSchema) {
      if (noChildSchema.hasOwnProperty(key) && !newSchemaObject.hasOwnProperty(key)) {
        newSchemaObject[key] = noChildSchema[key];
      }
    }

    for (const key in newSchemaObject) {
      if (newSchemaObject.hasOwnProperty(key)) {
        if (!newSchemaObject[key].hasOwnProperty('instance')) {
          const subArgs = {
            name: `${key}SubType_${randomName(10)}`,
            description: `sub-object type for ${key}`,
            class: args.class,
            schema: { paths: newSchemaObject[key] },
            exclude: args.exclude,
          };
          fields[key] = { type: createType(subArgs) };
        } else if (newSchemaObject[key].schema) {
          const subArgs = {
            name: `${newSchemaObject[key].path}SubType_${randomName(10)}`,
            description: `sub-object type for ${args.name}`,
            class: args.class,
            schema: newSchemaObject[key].schema,
            exclude: args.exclude,
          };
          const typeElement = createType(subArgs);
          fields[key] = { type: new GraphQLList(typeElement) };
        } else if (
          newSchemaObject[key] &&
          newSchemaObject[key].path &&
          newSchemaObject[key].instance &&
          newSchemaObject[key].path !== '__v' && !newSchemaObject[key].schema
        ) {
          fields = mapToObject(fields,
            newSchemaObject[key].path,
            newSchemaObject[key].instance,
            newSchemaObject);
        }
      }
    }

    if (args.exclude) {
      args.exclude.forEach((prop) => {
        if (fields[prop]) {
          delete fields[prop];
        }
      });
    }

    if (args.extend) {
      Object.keys(args.extend).forEach((prop) => {
        fields[prop] = args.extend[prop];
      });
    }

    // to support old version
    if (args.props) {
      Object.keys(args.props).forEach((prop) => {
        fields[prop] = args.props[prop];
      });
    }

    if (args.class === 'GraphQLObjectType') {
      return new GraphQLObjectType(GQLS);
    } else if (args.class === 'GraphQLInputObjectType') {
      return new GraphQLInputObjectType(GQLS);
    } else if (args.class === 'GraphQLInterfaceType') {
      return new GraphQLInterfaceType(GQLS);
    } else if (args.class === 'GraphQLUnionType') {
      return new GraphQLUnionType(GQLS);
    } else if (args.class === 'GraphQLEnumType') {
      return new GraphQLEnumType(GQLS);
    }
    return new SyntaxError('Enter correct graphQL class name.');
  }
}

export default createType;
