import {
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLUnionType,
    GraphQLInterfaceType,
    GraphQLEnumType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLList,
    GraphQLInt,
    GraphQLFloat
} from 'graphql';

let randomName = (len) => {
    let text = '',
        possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

let mapToObject = (mainObj, prop, instance) => {
    switch (instance) {
    case 'ObjectID':
        mainObj[prop] = {type: GraphQLString};
        break;
    case 'String':
        mainObj[prop] = {type: GraphQLString};
        break;
    case 'Date':
        mainObj[prop] = {type: GraphQLString};
        break;
    case 'Mixed':
        mainObj[prop] = {type: GraphQLString};
        break;
    case 'Boolean':
        mainObj[prop] = {type: GraphQLBoolean};
        break;
    case 'Buffer':
        mainObj[prop] = {type: GraphQLBoolean};
        break;
    case 'Number':
        mainObj[prop] = {type: GraphQLInt};
        break;
    case 'Array':
        mainObj[prop] = {type: new GraphQLList(GraphQLString)};
        break;
    }
    return mainObj;
};

let MTGQL = (args) => {
    if (args.schema && args.schema.paths) {
        let GQLS = {
                name: args.name,
                description: args.description,
                fields: {}
            },
            tmpArgsObj = {...args.schema.paths},
            newSchemaObject = {},
            noChildSchema = {};

        for (let key in tmpArgsObj) {
            if (tmpArgsObj[key].hasOwnProperty('schema')) {
                newSchemaObject[key] = tmpArgsObj[key];
                tmpArgsObj[key] = {};
            }
        }
        for (let key in tmpArgsObj) {
            if (tmpArgsObj.hasOwnProperty(key) && !tmpArgsObj[key].schema) {
                noChildSchema[key] = tmpArgsObj[key];
            }
        }
        Object.keys(noChildSchema).forEach(function (k) {
            if (!noChildSchema[k].hasOwnProperty('schema')) {
                var path = k.split('.'),
                    last = path.pop();

                if (path.length) {
                    path.reduce((r, a) => r[a] = r[a] || {}, noChildSchema)[last] = noChildSchema[k];
                    path.reduce((r, a) => r[a] = r[a] || {}, noChildSchema)[last].path = last;
                    delete noChildSchema[k];
                }
            }
        });
        for (let key in noChildSchema) {
            if (noChildSchema.hasOwnProperty(key) && !newSchemaObject.hasOwnProperty(key)) {
                newSchemaObject[key] = noChildSchema[key];
            }
        }

        for (let key in newSchemaObject) {
            if (newSchemaObject.hasOwnProperty(key)) {
                if (!newSchemaObject[key].hasOwnProperty('instance')) {
                    let subArgs = {
                        name: `${key}SubType_${randomName(10)}`,
                        description: `sub-object type for ${key}`,
                        class: 'GraphQLObjectType',
                        schema: {paths: newSchemaObject[key]},
                        exclude: args.exclude
                    };
                    GQLS.fields[key] = {type: MTGQL(subArgs)};
                } else if (newSchemaObject[key].schema) {
                    let subArgs = {
                            name: `${newSchemaObject[key].path}SubType_${randomName(10)}`,
                            description: `sub-object type for ${args.name}`,
                            class: 'GraphQLObjectType',
                            schema: newSchemaObject[key].schema,
                            exclude: args.exclude
                        },
                        typeElement = MTGQL(subArgs);
                    GQLS.fields[key] = {type: new GraphQLList(typeElement)};
                } else if (
                    newSchemaObject[key] &&
                    newSchemaObject[key].path &&
                    newSchemaObject[key].instance &&
                    newSchemaObject[key].path !== '__v' && !newSchemaObject[key].schema
                ) {
                    GQLS.fields = mapToObject(GQLS.fields,
                        newSchemaObject[key].path,
                        newSchemaObject[key].instance,
                        newSchemaObject,
                        args.exclude);
                }
            }
        }

        if (args.exclude) {
            args.exclude.forEach(prop => {
                if (GQLS.fields[prop]) {
                    delete GQLS.fields[prop];
                }
            });
        }

        if (args.props) {
            Object.keys(args.props).forEach((prop) => {
                GQLS.fields[prop] = args.props[prop];
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
        } else {
            return new SyntaxError('Enter correct graphQL class name.');
        }
    }
};

export default MTGQL;
