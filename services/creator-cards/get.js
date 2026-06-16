const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');
const { serializeCard } = require('@app/utils/common');

async function getCreatorCard(serviceData, options = {}) {
    let response;

    const { slug, access_code } = serviceData;

    try {
        const card = await creatorCardRepository.findOne({ slug });

        if (!card || card.deleted != null) {
            throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
        }

        if (card.status === 'draft') {
            throwAppError(CreatorCardMessages.DRAFT_NOT_FOUND, ERROR_CODE.NF02);
        }

        if (card.access_type == 'private') {
            if (!access_code) {
                throwAppError(CreatorCardMessages.PRIVATE_NO_CODE, ERROR_CODE.AC03);
            }

            if (card.access_code !== access_code) {
                throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, ERROR_CODE.AC04);
            }
        }
        const cardObject = card.toJSON();
        // delete cardObject.access_code;
        response = cardObject;
    } catch (error) {
        throw error;
    }

    return serializeCard(response);
}

modules.export = getCreatorCard;