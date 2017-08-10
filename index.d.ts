import * as mongoose from 'mongoose';

type ConfigurationObject = {
    name: string,
    description: string,
    class: string,
    schema: mongoose.Schema,
    exclude: [string],
    extend: {string:any},
    fields: {string: any},
};

declare function mainFunction(config: ConfigurationObject): any;

export = mainFunction;
