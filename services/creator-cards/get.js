const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const CreatorCard = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');
const { serializeCard } = require('./utils');

async function getCreatorCard(serviceData) {
  const { slug, access_code: accessCode } = serviceData;
  const card = await CreatorCard.findOne({ query: { slug } });

  if (!card || card.deleted !== null) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
  }

  if (card.status === 'draft') {
    throwAppError(CreatorCardMessages.DRAFT_NOT_FOUND, ERROR_CODE.NF02);
  }

  if (card.access_type === 'private') {
    if (!accessCode) {
      throwAppError(CreatorCardMessages.PRIVATE_NO_CODE, ERROR_CODE.AC03);
    }

    if (card.access_code !== accessCode) {
      throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, ERROR_CODE.AC04);
    }
  }
  const cardObject = card.toJSON();
  // delete cardObject.access_code;
  const response = cardObject;

  return serializeCard(response);
}

module.exports = getCreatorCard;
