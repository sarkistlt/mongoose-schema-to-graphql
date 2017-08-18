declare module 'mongoose-schema-to-graphql' {

    import * as mongoose from 'mongoose';

    type ConfigurationObject = {
        name: string,
        description?: string,
        class: string,
        schema: mongoose.Schema,
        exclude?: [string],
        extend?: { string: any },
        fields?: { string: any },
    };

    function mainFunction(config: ConfigurationObject): any;

    export = mainFunction;
}
