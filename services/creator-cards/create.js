const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCard } = require('@app/models');
const { CreatorCardMessages } = require('@app/messages');
const { generateSlugFromTitle, isSlugUnique } = require('@app/utils/slug');

const createSpec = validator.parse(`
        root {
            title string<3,100>
            description? string<0,500>
            slug? string<5,50>[a-zA-Z0-9_-]
            creator_reference string<20,20>
            links[]? {
                title string<1,100>
                url string<0,200> startsWith("http://", "https://")
            }
            service_rates? {
                currency string(NGN|USD|GBP|GHS)
                rates[] {
                    name string<3,100>
                    description? string<0,250>
                    amount number<1,>
                }
            }
            status string(draft|published)
            access_type? string(public|private)
            access_code? string<6,6>[A-Za-z0-9]
        }
    `)

async function createCreatorCard(serviceData, options = {}) {
    let response;

    const data = validator.validator(serviceData, createSpec);

    try {
        const accessType = data.access_type || 'public';

        if (accessType === 'private' && !data.access_code) {
            throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, ERROR_CODES.INVLDDATA);
        }

        if (accessType === 'public' && data.access_code) {
            throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED, ERROR_CODES.INVLDDATA);
        }

        let slug = data.slug;
        if (!slug) {
            slug = generateSlugFromTitle(data.title);
        } else {
            const unique = await isSlugUnique(slug);
            if (!unique) {
                throwAppError(CreatorCardMessages.SLUG_TAKEN, ERROR_CODES.DUPLRCRD);
            }
        }

        const cardData = {
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
            deleted: null
        };

        const card = new CreatorCard(cardData);
        await card.save();

        response = card.toJSON();
    } catch (error) {
        throw error;
    }
    return response;
}

module.exports = createCreatorCard;