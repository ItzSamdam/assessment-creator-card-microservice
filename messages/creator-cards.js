const CreatorCardMessages = {
  // Success messages
  CREATE_SUCCESS: 'Creator Card Created Successfully.',
  RETRIEVE_SUCCESS: 'Creator Card Retrieved Successfully.',
  DELETE_SUCCESS: 'Creator Card Deleted Successfully.',

  // Business rule errors
  SLUG_TAKEN: 'Slug is already taken',
  ACCESS_CODE_REQUIRED: 'access_code is required when access_type is private',
  ACCESS_CODE_INVALID: 'access_code can only be set on private cards',
  CARD_NOT_FOUND: 'Creator card not found',
  DRAFT_NOT_FOUND: 'Creator card not found',
  PRIVATE_NO_CODE: 'This card is private. An access code is required',
  INVALID_ACCESS_CODE: 'Invalid access code',

  // Validation errors
  TITLE_REQUIRED: 'Title is required',
  TITLE_LENGTH: 'Title must be between 3 and 100 characters',
  CREATOR_REFERENCE_REQUIRED: 'creator_reference is required',
  CREATOR_REFERENCE_LENGTH: 'creator_reference must be exactly 20 characters',
  STATUS_REQUIRED: 'status is required',
  STATUS_INVALID: 'status must be draft or published',
};

module.exports = CreatorCardMessages;
