const CreatorCard = require('../models/CreatorCard');

// function to generate a unique slug from a title
const generateSlugFromTitle = async (title) => {
    let baseSlug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '');

    let slug = baseSlug;
    let exists = await CreatorCard.findOne({ slug });
    let counter = 0;

    while (exists && counter < 10) {
        const suffix = Math.random().toString(36).substring(2, 8);
        slug = `${baseSlug.slice(0, 40)}-${suffix}`;
        exists = await CreatorCard.findOne({ slug });
        counter++;
    }

    if (counter === 10) {
        throw new Error('Unable to generate unique slug');
    }

    return slug;
};

const isSlugUnique = async (slug, excludeId = null) => {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await CreatorCard.findOne(query);
    return !existing;
};

module.exports = { generateSlugFromTitle, isSlugUnique };