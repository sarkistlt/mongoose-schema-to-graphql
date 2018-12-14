[![License](https://img.shields.io/npm/l/mongoose-schema-to-graphql.svg)](https://www.npmjs.com/package/mongoose-schema-to-graphql)
[![NPM](https://img.shields.io/npm/v/mongoose-schema-to-graphql.svg)](https://www.npmjs.com/package/mongoose-schema-to-graphql)
[![Build Status](https://travis-ci.org/sarkistlt/mongoose-schema-to-graphql.svg?branch=master)](https://travis-ci.org/sarkistlt/mongoose-schema-to-graphql)

## Use your existed Mongoose schema to generate graphQL types.
#### Date fields supported, they get serialized to ISO date string
#### Full support of all graphQL "Definitions" and "Scalars" besides "GraphQLFloat", because in Mongoose schema you can use only int. numbers. But you can use ```extend``` property to pass it, details below. 

This package will help you  avoid typing schemas for same essence.
If you already have Mongoose schema that's enough to generate graphQL type.

### How it works.
First:
~~~shell
npm i -S mongoose-schema-to-graphql
~~~

or

~~~shell
yarn add mongoose-schema-to-graphql
~~~

Make sure that your ```graphql``` package is the same version as used in ```mongoose-schema-to-graphql``` or vice versa.

Then:
~~~js
import createType from 'mongoose-schema-to-graphql';
~~~

`createType` function accept obj as argument with following structure:
~~~js
const config = {
              name: 'couponType', //graphQL type's name
              description: 'Coupon base schema', //graphQL type's description
              class: 'GraphQLObjectType', //"definitions" class name
              schema: couponSchema, //your Mongoose schema "let couponSchema = mongoose.Schema({...})"
              exclude: ['_id'], //fields which you want to exclude from mongoose schema
              extend: {
                price: {type: GraphQLFloat}
              } //add custom properties or overwrite existed
          }
~~~

After you declared config. object you're ready to go. Examples below:
~~~js
dbSchemas.js

export const couponSchema = mongoose.Schema({
    couponCode: Array,
    description: String,
    discountType: String,
    discountAmount: String,
    minimumAmount: String,
    singleUseOnly: Boolean,
    createdAt: mongoose.Schema.Types.Date,
    updatedAt: mongoose.Schema.Types.Date,
    expirationDate: mongoose.Schema.Types.Date,
    isMassPromo: Boolean,
    couponBatchId: String,
    maximumAmount: String,
    isPublished: Boolean
});
~~~

~~~js
import createType from 'mongoose-schema-to-graphql';
import { couponSchema } from './dbSchemas';

const config = {
    name: 'couponType',
    description: 'Coupon schema',
    class: 'GraphQLObjectType',
    schema: couponSchema,
    exclude: ['_id']
};
          
export default createType(config);
~~~
 
It will be equal to:
~~~js
import {...} from 'graphql';
import { couponSchema } from './dbSchemas';

export default new GraphQLObjectType({
    name: 'couponType',
    description: 'Coupon schema',
    fields: {
        couponCode: {type: new GraphQLList(GraphQLString)},
        description: {type: GraphQLString},
        discountType: {type: GraphQLString},
        discountAmount: {type: GraphQLString},
        minimumAmount: {type: GraphQLString},
        singleUseOnly: {type: GraphQLBoolean},
        createdAt: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
        expirationDate: {type: GraphQLString},
        isMassPromo: {type: GraphQLBoolean},
        couponBatchId: {type: GraphQLString},
        maximumAmount: {type: GraphQLString},
        isPublished: {type: GraphQLBoolean}
    }
});
~~~

Note: If you pass mongoose type ```Array``` it will be converted to ```{type: new GraphQLList(GraphQLString)}```
If you want to create a list of another type, you would need to declare it in Mongoose schema too:
~~~js
const quizSchema = mongoose.Schema({
    message: String,
    createdAt: mongoose.Schema.Types.Date,
    updatedAt: mongoose.Schema.Types.Date
});

export const customerSchema = mongoose.Schema({
    createdAt: mongoose.Schema.Types.Date,
    updatedAt: mongoose.Schema.Types.Date,
    firstName: String,
    lastName: String,
    email: String,
    quiz: [quizSchema],
    subscription: {
        status: String,
        plan: String,
        products: Array
    }
});
~~~

Then: 
~~~js
import createType from 'mongoose-schema-to-graphql';
import { customerSchema } from './dbSchemas';

const config = {
    name: 'customerType',
    description: 'Customer schema',
    class: 'GraphQLObjectType',
    schema: customerSchema,
    exclude: ['_id']
};
          
export default createType(config);
~~~

It's equal to:
~~~js
import {...} from 'graphql';
import { customerSchema } from './dbSchemas';

const quizType = new GraphQLObjectType({
    name: 'quizType',
    description: 'quiz type for customer',
    fields: {
        message: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
        createdAt: {type: GraphQLString}
    }
});

export default new GraphQLObjectType({
    name: 'customerType',
    description: 'Customer schema',
    fields: {
        createdAt: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
        firstName: {type: GraphQLString},
        lastName: {type: GraphQLString},
        email: {type: GraphQLString},
        quiz: {type: new GraphQLList(quizType)},
        subscription: {
            type: new GraphQLObjectType({
                name: 'subscription',
                fields: () => ({
                    status: {type: GraphQLString},
                    plan: {type: GraphQLString},
                    products: {type: new GraphQLList(GraphQLString)}
                })
            })
        }
    }
});
~~~

###```extend``` property in config object.
You can use this field to pass some additional extend. to graphQL type, for example:
~~~js
import { GraphQLFloat } from 'graphql';
import createType from 'mongoose-schema-to-graphql';
import { customerSchema } from './dbSchemas';

const config = {
    name: 'customerType',
    description: 'Customer schema',
    class: 'GraphQLObjectType',
    schema: customerSchema,
    exclude: ['_id'],
    extend: {
      price: {type: GraphQLFloat}
    }
};
          
export default createType(config);
~~~

It's equal to:
~~~js
import {...} from 'graphql';
import { customerSchema } from './dbSchemas';

const quizType = new GraphQLObjectType({
    name: 'quizType',
    description: 'quiz type for customer',
    fields: {
        message: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
        createdAt: {type: GraphQLString}
    }
});

export default new GraphQLObjectType({
    name: 'customerType',
    description: 'Customer schema',
    fields: {
        price: {type: GraphQLFloat},
        createdAt: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
        firstName: {type: GraphQLString},
        lastName: {type: GraphQLString},
        email: {type: GraphQLString},
        quiz: {type: new GraphQLList(quizType)},
        subscription: {
            type: new GraphQLObjectType({
                name: 'subscription',
                fields: () => ({
                    status: {type: GraphQLString},
                    plan: {type: GraphQLString},
                    products: {type: new GraphQLList(GraphQLString)}
                })
            })
        }
    }
});
~~~

If passed extend. already exist in Mongoose schema, for example ```price: Number``` it will be overwrite with prop. we passed in config. object. 

If you have any suggestion please leave me a message.
##### star to be up to date.
