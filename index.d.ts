declare module 'mongoose-schema-to-graphql' {

    import * as mongoose from 'mongoose';

    type ClassFieldType =
        'GraphQLObjectType' |
        'GraphQLInputObjectType' |
        'GraphQLInterfaceType' |
        'GraphQLUnionType' |
        'GraphQLEnumType';

    type ConfigurationObject = {
        name: string,
        description?: string,
        class: ClassFieldType,
        schema: mongoose.Schema,
        exclude?: [string],
        extend?: { [key: string]: any },
        fields?: { [key: string]: any },
    };

  export function mainFunction(config: ConfigurationObject): any;
}
