const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const CreatorCard = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');
const validator = require('@app-core/validator');
const { serializeCard } = require('./utils');

const deleteSpec = validator.parse(`
    root {
        creator_reference string<trim|length:20>
    }
  `);

async function deleteCreatorCard(serviceData) {
  const data = validator.validate(serviceData, deleteSpec);

  const card = await CreatorCard.findOne({ slug: data.slug, deleted: null });

  if (!card) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
  }

  if (card.creator_reference !== data.creator_reference) {
    throwAppError('Creator reference does not match', ERROR_CODE.PERMERR);
  }

  const now = Date.now();
  await CreatorCard.updateOne({
    query: { _id: card._id },
    updateValues: { deleted: now },
  });

  card.deleted = now;
  card.updated = now;

  const response = card.toJSON();

  return serializeCard(response);
}

module.exports = deleteCreatorCard;
