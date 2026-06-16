const createCreatorCard = require("@app/services/creator-cards/create");
const { CreatorCardMessages } = require("@app/messages");
const { createHandler } = require("@app-core/server")

module.exports = createHandler({
    path: '/creator-cards',
    method: 'post',
    middlewares: [],
    async handler(rc, helpers) {
        const payload = rc.body;
        const response = await createCreatorCard(payload);
        return {
            status: helpers.http_statuses.HTTP_200_OK,
            message: CreatorCardMessages.CREATE_SUCCESS,
            data: response
        };
    }
});