const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCard } = require('@app/models');
const { CreatorCardMessages } = require('@app/messages');

async function getCreatorCard(serviceData, options = {}) {
    let response;

    const { slug, access_code } = serviceData;

    try {
        const card = await CreatorCard.findOne({ slug });

        if (!card || card.deleted != null) {
            throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NOTFOUND);
        }

        if (card.status === 'draft') {
            throwAppError(CreatorCardMessages.DRAFT_NOT_FOUND, ERROR_CODE.NOTFOUND);
        }

        if (card.access_type == 'private') {
            if (!access_code) {
                throwAppError(CreatorCardMessages.PRIVATE_NO_CODE, ERROR_CODE.PERMERR);
            }

            if (card.access_code !== access_code) {
                throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, ERROR_CODE.PERMERR);
            }
        }
        const cardObject = card.toJSON();
        delete cardObject.access_code;
        response = cardObject;
    } catch (error) {
        throw error;
    }

    return response;
}

modules.export = getCreatorCard;