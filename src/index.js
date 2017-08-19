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
    const GQLS = {
      name: args.name,
      description: args.description,
      fields: {},
    };
    const tmpArgsObj = { ...args.schema.paths };
    const newSchemaObject = {};
    const noChildSchema = {};
    const circularFields = [];
    const circularListFields = [];

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
        if (
          !newSchemaObject[key].caster &&
          !newSchemaObject[key].hasOwnProperty('instance')
        ) {
          const subArgs = {
            name: `${key}SubType_${randomName(10)}`,
            description: `sub-object type for ${key}`,
            class: args.class,
            schema: { paths: newSchemaObject[key] },
            exclude: args.exclude,
          };
          GQLS.fields[key] = { type: createType(subArgs) };
        } else if (
          !newSchemaObject[key].caster &&
          newSchemaObject[key].schema
        ) {
          const subArgs = {
            name: `${newSchemaObject[key].path}SubType_${randomName(10)}`,
            description: `sub-object type for ${args.name}`,
            class: args.class,
            schema: newSchemaObject[key].schema,
            exclude: args.exclude,
          };
          const typeElement = createType(subArgs);
          GQLS.fields[key] = { type: new GraphQLList(typeElement) };
        } else if (
          !newSchemaObject[key].caster &&
          newSchemaObject[key] &&
          newSchemaObject[key].path &&
          newSchemaObject[key].instance &&
          newSchemaObject[key].path !== '__v' && !newSchemaObject[key].schema
        ) {
          GQLS.fields = mapToObject(GQLS.fields,
            newSchemaObject[key].path,
            newSchemaObject[key].instance,
            newSchemaObject);
        } else if (newSchemaObject[key].caster) {
          if (newSchemaObject[key].casterConstructor) {
            circularListFields.push(key);
          } else {
            circularFields.push(key);
          }
          GQLS.fields[key] = {};
        }
      }
    }

    if (args.exclude) {
      args.exclude.forEach((prop) => {
        if (GQLS.fields[prop]) {
          delete GQLS.fields[prop];
        }
      });
    }

    if (args.extend) {
      Object.keys(args.extend).forEach((prop) => {
        GQLS.fields[prop] = args.extend[prop];
      });
    }

    // to support old version
    if (args.props) {
      Object.keys(args.props).forEach((prop) => {
        GQLS.fields[prop] = args.props[prop];
      });
    }

    if (args.class === 'GraphQLObjectType') {


      const typeSchema = new GraphQLObjectType({
        ...GQLS,
        fields: () => {
          circularFields.forEach(key => (GQLS.fields[key] = typeSchema));
          circularListFields.forEach(key => (GQLS.fields[key] = new GraphQLList(typeSchema)));

          return GQLS.fields;
        },
      });
      return typeSchema;
    } else if (args.class === 'GraphQLInputObjectType') {
      const typeSchema = new GraphQLInputObjectType({
        ...GQLS,
        fields: () => {
          circularFields.forEach(key => (GQLS.fields[key] = typeSchema));
          circularListFields.forEach(key => (GQLS.fields[key] = new GraphQLList(typeSchema)));

          return GQLS.fields;
        },
      });
      return typeSchema;
    } else if (args.class === 'GraphQLInterfaceType') {
      const typeSchema = new GraphQLInterfaceType({
        ...GQLS,
        fields: () => {
          circularFields.forEach(key => (GQLS.fields[key] = typeSchema));
          circularListFields.forEach(key => (GQLS.fields[key] = new GraphQLList(typeSchema)));

          return GQLS.fields;
        },
      });
      return typeSchema;
    } else if (args.class === 'GraphQLUnionType') {
      const typeSchema = new GraphQLUnionType({
        ...GQLS,
        fields: () => {
          circularFields.forEach(key => (GQLS.fields[key] = typeSchema));
          circularListFields.forEach(key => (GQLS.fields[key] = new GraphQLList(typeSchema)));

          return GQLS.fields;
        },
      });
      return typeSchema;
    } else if (args.class === 'GraphQLEnumType') {
      const typeSchema = new GraphQLEnumType({
        ...GQLS,
        fields: () => {
          circularFields.forEach(key => (GQLS.fields[key] = typeSchema));
          circularListFields.forEach(key => (GQLS.fields[key] = new GraphQLList(typeSchema)));

          return GQLS.fields;
        },
      });
      return typeSchema;
    }
    return new SyntaxError('Enter correct graphQL class name.');
  }
}

export default createType;
