const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');
const { serializeCard } = require('@app/utils/common');

const deleteSpec = validator.parse(`
    root {
        creator_reference string<trim|length:20>
    }
  `);

async function deleteCreatorCard(serviceData, options = {}) {
    let response;

    const data = validator.validate(serviceData, deleteSpec);

    const { slug, creator_reference } = serviceData;

    try {

        const card = await creatorCardRepository.findOne({ slug, deleted: null });

        if (!card) {
            throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
        }

        if (card.creator_reference != creator_reference) {
            throwAppError('Creator reference does not match', ERROR_CODE.PERMERR);
        }

        const now = Date.now();
        await creatorCardRepository.updateOne({
            query: { _id: card._id },
            updateValues: { deleted: now },
        });

        card.deleted = now;
        card.updated = now;

        response = card.toJSON();
    } catch (error) {
        throw error;
    }

    return serializeCard(response);
}

module.exports = deleteCreatorCard;