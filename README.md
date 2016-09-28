## Use your existed Mongoose schema to generate graphQL types.
#### Full support of all graphQL "Definitions" and "Scalars" besides "GraphQLFloat", because in Mongoose schema you can use only int. numbers. But you can use ```props``` property to pass it, details below. 

This package will help you  avoid typing schemas for same essence.
If you already have Mongoose schema that's enough to generate graphQL type.

###How it works.
First:
~~~shell
npm i --save mongoose-schema-to-graphql
~~~
Make sure that your ```graphql``` package is the same version as used in ```mongoose-schema-to-graphql``` or vice versa.

Then:
~~~js
import MTGQL from 'mongoose-schema-to-graphql';
~~~

MTGQL function accept obj as argument with following structure:
~~~js
let configs = {
              name: 'couponType', //graphQL type's name
              description: 'Coupon base schema', //graphQL type's description
              class: 'GraphQLObjectType', //"definitions" class name
              schema: couponSchema, //your Mongoose schema "let couponSchema = mongoose.Schema({...})"
              exclude: ['_id'], //fields which you want to exclude from mongoose schema
              props: {
                price: {type: GraphQLFloat}
              } //add custom properties or overwrite existed
          }
~~~

After you declared config. object you're ready to go. Examples below:
~~~js
dbSchemas.js

export let couponSchema = mongoose.Schema({
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
import MTGQL from 'mongoose-schema-to-graphql';
import {couponSchema} from './dbSchemas';

let configs = {
              name: 'couponType',
              description: 'Coupon schema',
              class: 'GraphQLObjectType',
              schema: couponSchema,
              exclude: ['_id']
          }
          
export let couponType = MTGQL(configs);
~~~
 
It will be equal to:
~~~js
import {...} from 'graphql';
import MTGQL from 'mongoose-schema-to-graphql';
import {couponSchema} from './dbSchemas';

export let couponType = new GraphQLObjectType({
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
let quizSchema = mongoose.Schema({
    message: String,
    createdAt: mongoose.Schema.Types.Date,
    updatedAt: mongoose.Schema.Types.Date
});

let customerSchema = mongoose.Schema({
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
import MTGQL from 'mongoose-schema-to-graphql';
import {customerSchema} from './dbSchemas';

let configs = {
              name: 'customerType',
              description: 'Customer schema',
              class: 'GraphQLObjectType',
              schema: customerSchema,
              exclude: ['_id']
          }
          
export let couponType = MTGQL(configs);
~~~

It's equal to:
~~~js
import {...} from 'graphql';
import MTGQL from 'mongoose-schema-to-graphql';
import {customerSchema} from './dbSchemas';

let quizType = new GraphQLObjectType({
    name: 'quizType',
    description: 'quiz type for customer',
    fields: {
        message: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
        createdAt: {type: GraphQLString}
    }
});

export let customerType = new GraphQLObjectType({
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

###```props``` property in config object.
You can use this field to pass some additional props. to graphQL schema, for example:
~~~js
import {GraphQLFloat} from 'graphql';
import MTGQL from 'mongoose-schema-to-graphql';
import {customerSchema} from './dbSchemas';

let configs = {
              name: 'customerType',
              description: 'Customer schema',
              class: 'GraphQLObjectType',
              schema: customerSchema,
              exclude: ['_id'],
              props: {
                price: {type: GraphQLFloat}
              }
          }
          
export let couponType = MTGQL(configs);
~~~

It's equal to:
~~~js
import {...} from 'graphql';
import MTGQL from 'mongoose-schema-to-graphql';
import {customerSchema} from './dbSchemas';

let quizType = new GraphQLObjectType({
    name: 'quizType',
    description: 'quiz type for customer',
    fields: {
        message: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
        createdAt: {type: GraphQLString}
    }
});

export let customerType = new GraphQLObjectType({
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

If passed props. already exist in Mongoose schema, for example ```price: Number``` it will be overwrite with prop. we passed in config. object. 

If you have any suggestion please leave me a message.
##### star to be up to date.
