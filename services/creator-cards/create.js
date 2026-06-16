const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const CreatorCard = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');
const { ulid } = require('ulid');
const { generateSlugFromTitle, isSlugUnique, serializeCard } = require('./utils');

const createSpec = validator.parse(`
    root {
        title string<trim|minLength:3|maxLength:100>
        description? string<trim|maxLength:500>
        slug? string<trim|minLength:5|maxLength:50>
        creator_reference string<trim|length:20>
        links[]? {
            title string<trim|minLength:1|maxLength:100>
            url string<trim|maxLength:200>
        }
        service_rates? {
            currency string(NGN|USD|GBP|GHS)
            rates[]? {
            name string<trim|minLength:3|maxLength:100>
            description? string<trim|maxLength:250>
            amount number
            }
        }
        status string(draft|published)
        access_type? string(public|private)
        access_code? string<trim|length:6>
      }
  `);

async function createCreatorCard(serviceData) {
  const data = validator.validate(serviceData, createSpec);

  // business logic validation for creator card links
  if (data.links) {
    data.links.forEach((link, idx) => {
      if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
        throwAppError(
          `Link at index ${idx} url must start with http:// or https://`,
          ERROR_CODE.INVLDDATA,
          {
            details: [
              {
                field: `links.${idx}.url`,
                message: 'Link URL must start with http:// or https://',
              },
            ],
          }
        );
      }
    });
  }
  if (data.service_rates) {
    const { rates } = data.service_rates;
    if (!rates || !Array.isArray(rates) || rates.length === 0) {
      throwAppError(
        'rates must be a non-empty array when service_rates is present',
        ERROR_CODE.INVLDDATA,
        {
          details: [
            {
              field: 'service_rates.rates',
              message: 'Rates array must not be empty',
            },
          ],
        }
      );
    }

    rates.forEach((rate, idx) => {
      if (!Number.isInteger(rate.amount) || rate.amount <= 0) {
        throwAppError(
          `Rate amount at index ${idx} must be a positive integer`,
          ERROR_CODE.INVLDDATA,
          {
            details: [
              {
                field: `service_rates.rates.${idx}.amount`,
                message: 'Amount must be a positive integer (minor units)',
              },
            ],
          }
        );
      }
    });
  }
  const accessType = data.access_type || 'public';

  if (data.access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, ERROR_CODE.AC01);
  }

  if (accessType === 'private' && !data.access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, ERROR_CODE.AC01);
  }

  if (accessType === 'public' && data.access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED, ERROR_CODE.AC05);
  }

  let { slug } = data;
  if (!slug) {
    slug = generateSlugFromTitle(data.title);
  } else {
    const unique = await isSlugUnique(slug);
    if (!unique) {
      throwAppError(CreatorCardMessages.SLUG_TAKEN, ERROR_CODE.SL02);
    }
  }

  const cardData = {
    _id: ulid(),
    title: data.title,
    description: data.description || '',
    slug,
    creator_reference: data.creator_reference,
    links: data.links || [],
    service_rates: data.service_rates || null,
    status: data.status,
    access_type: accessType,
    access_code: accessType === 'private' ? data.access_code : null,
    created: new Date(),
    updated: new Date(),
    deleted: null,
  };

  const card = await CreatorCard(cardData);

  const response = card.toJSON();

  return serializeCard(response);
}

module.exports = createCreatorCard;
