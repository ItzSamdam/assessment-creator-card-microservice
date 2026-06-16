const CreatorCard = require('@app/repository/creator-card');

// function to generate a unique slug from a title
const generateSlugFromTitle = async (title) => {
  const baseSlug = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');

  let slug = baseSlug;
  let exists = await CreatorCard.findOne({ query: { slug } });
  let counter = 0;

  while (exists && counter < 10) {
    const suffix = Math.random().toString(36).substring(2, 8);
    slug = `${baseSlug.slice(0, 40)}-${suffix}`;
    exists = CreatorCard.findOne({ query: { slug } });
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
  const existing = await CreatorCard.findOne({ query });
  return !existing;
};

function serializeCard(card) {
  if (!card) return null;
  return {
    id: card._id,
    title: card.title,
    description: card.description || null,
    slug: card.slug,
    creator_reference: card.creator_reference,
    links: card.links ? card.links.map((l) => ({ title: l.title, url: l.url })) : [],
    service_rates: card.service_rates
      ? {
          currency: card.service_rates.currency,
          rates: card.service_rates.rates
            ? card.service_rates.rates.map((r) => ({
                name: r.name,
                description: r.description || null,
                amount: r.amount,
              }))
            : [],
        }
      : null,
    status: card.status,
    access_type: card.access_type || 'public',
    // access_code: card.access_code || null,
    created: card.created,
    updated: card.updated,
    deleted: card.deleted,
  };
}

module.exports = { generateSlugFromTitle, isSlugUnique, serializeCard };
