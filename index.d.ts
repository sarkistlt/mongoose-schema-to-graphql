import * as mongoose from 'mongoose';

declare module 'mongoose-schema-to-graphql' {
    type ConfigurationObject = {
        name: string,
        description: string,
        class: string,
        schema: mongoose.Schema,
        exclude: [string],
        extend: {string:any},
        fields: {string: any},
    };

    export = (config: ConfigurationObject) => any;
}
