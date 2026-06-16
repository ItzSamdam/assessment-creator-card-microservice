async function deleteCreatorCard(serviceData, options = {}) {
    let response;

    const { slug, creator_reference } = serviceData;

    try {

        const card = await CreatorCard.findOne({ slug });

        if (!card) {
            throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NOTFOUND);
        }

        if (card.creator_reference != creator_reference) {
            throwAppError('Creator reference does not match', ERROR_CODE.PERMERR);
        }

        card.deleted = Date.now();
        await card.save();

        response = card.toJSON();
    } catch (error) {
        throw error;
    }

    return response;
}

module.exports = deleteCreatorCard;