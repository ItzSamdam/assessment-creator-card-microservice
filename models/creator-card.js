const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'creatorcards';

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} title
 * @property {String} description
 * @property {String} slug
 * @property {String} creator_reference
 * @property {Array} links
 * @property {Object} service_rates
 * @property {String} status
 * @property {String} access_type
 * @property {String} access_code
 * @property {Number} created
 * @property {Number} updated
 * @property {Number} deleted
 */

/**
 * @typedef {Object} Link
 * @property {String} title
 * @property {String} url
 */

/**
 * @typedef {Object} Rate
 * @property {String} name
 * @property {String} description
 * @property {Number} amount
 */

/**
 * @typedef {Object} ServiceRates
 * @property {String} currency
 * @property {Array} rates
 */

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  title: { type: SchemaTypes.String, required: true },
  description: { type: SchemaTypes.String, default: '' },
  slug: { type: SchemaTypes.String, required: true, unique: true, index: true },
  creator_reference: { type: SchemaTypes.String, required: true },
  links: {
    type: [
      {
        title: { type: SchemaTypes.String, required: true },
        url: { type: SchemaTypes.String, required: true },
      },
    ],
    required: false,
    default: [],
  },
  service_rates: {
    type: {
      currency: { type: SchemaTypes.String, enum: ['NGN', 'USD', 'GBP', 'GHS'], required: true },
      rates: [
        {
          name: { type: SchemaTypes.String, required: true },
          description: { type: SchemaTypes.String, required: true },
          amount: { type: SchemaTypes.Number, required: true, min: 1 },
        },
      ],
    },
    required: false,
    default: null,
  },
  status: { type: SchemaTypes.String, enum: ['draft', 'published'], required: true },
  access_type: { type: SchemaTypes.String, enum: ['public', 'private'], default: 'public' },
  access_code: { type: SchemaTypes.String, default: null },
  created: { type: SchemaTypes.Number, default: Date.now },
  updated: { type: SchemaTypes.Number, default: Date.now },
  deleted: { type: SchemaTypes.Number, default: null },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

// Add pre-save middleware to update timestamp
// modelSchema.pre('save', function (next) {
//     this.updated = Date.now();
//     next();
// });

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema);
