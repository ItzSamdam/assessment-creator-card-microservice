const deleteCreatorCard = require('@app/services/creator-cards/delete');
const { CreatorCardMessages } = require('@app/messages');
const { createHandler } = require('@app-core/server');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async handler(rc, helpers) {
    const payload = {
      slug: rc.params,
      creator_reference: rc.body.creator_reference,
    };
    const response = await deleteCreatorCard(payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.DELETE_SUCCESS,
      data: response,
    };
  },
});
