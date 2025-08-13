import type { ProfileInsert, ProfileUpdate, PostInsert, PostUpdate, CommentInsert, CommentUpdate } from '../database/types';

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!username) {
    errors.push({ field: 'username', message: 'Username is required' });
  } else {
    if (username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters long' });
    }
    if (username.length > 30) {
      errors.push({ field: 'username', message: 'Username must be no more than 30 characters long' });
    }
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      errors.push({ field: 'username', message: 'Username can only contain letters, numbers, dots, and underscores' });
    }
    if (username.startsWith('.') || username.endsWith('.')) {
      errors.push({ field: 'username', message: 'Username cannot start or end with a dot' });
    }
    if (username.includes('..')) {
      errors.push({ field: 'username', message: 'Username cannot contain consecutive dots' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Bio validation
export const validateBio = (bio: string | null): ValidationResult => {
  const errors: ValidationError[] = [];

  if (bio && bio.length > 150) {
    errors.push({ field: 'bio', message: 'Bio must be no more than 150 characters long' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Website URL validation
export const validateWebsite = (website: string | null): ValidationResult => {
  const errors: ValidationError[] = [];
  const urlRegex = /^https?:\/\/.+\..+/;

  if (website && !urlRegex.test(website)) {
    errors.push({ field: 'website', message: 'Please enter a valid website URL (must start with http:// or https://)' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Profile validation
export const validateProfileInsert = (profile: ProfileInsert): ValidationResult => {
  const allErrors: ValidationError[] = [];

  // Validate username
  const usernameValidation = validateUsername(profile.username);
  allErrors.push(...usernameValidation.errors);

  // Validate bio
  if (profile.bio !== undefined) {
    const bioValidation = validateBio(profile.bio);
    allErrors.push(...bioValidation.errors);
  }

  // Validate website
  if (profile.website !== undefined) {
    const websiteValidation = validateWebsite(profile.website);
    allErrors.push(...websiteValidation.errors);
  }

  // Validate full_name
  if (profile.full_name && profile.full_name.length > 100) {
    allErrors.push({ field: 'full_name', message: 'Full name must be no more than 100 characters long' });
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

export const validateProfileUpdate = (profile: ProfileUpdate): ValidationResult => {
  const allErrors: ValidationError[] = [];

  // Validate username if provided
  if (profile.username !== undefined) {
    const usernameValidation = validateUsername(profile.username);
    allErrors.push(...usernameValidation.errors);
  }

  // Validate bio if provided
  if (profile.bio !== undefined) {
    const bioValidation = validateBio(profile.bio);
    allErrors.push(...bioValidation.errors);
  }

  // Validate website if provided
  if (profile.website !== undefined) {
    const websiteValidation = validateWebsite(profile.website);
    allErrors.push(...websiteValidation.errors);
  }

  // Validate full_name if provided
  if (profile.full_name && profile.full_name.length > 100) {
    allErrors.push({ field: 'full_name', message: 'Full name must be no more than 100 characters long' });
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// Post validation
export const validatePostInsert = (post: PostInsert): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!post.image_url) {
    errors.push({ field: 'image_url', message: 'Image URL is required' });
  }

  if (!post.user_id) {
    errors.push({ field: 'user_id', message: 'User ID is required' });
  }

  if (post.caption && post.caption.length > 2200) {
    errors.push({ field: 'caption', message: 'Caption must be no more than 2200 characters long' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePostUpdate = (post: PostUpdate): ValidationResult => {
  const errors: ValidationError[] = [];

  if (post.caption && post.caption.length > 2200) {
    errors.push({ field: 'caption', message: 'Caption must be no more than 2200 characters long' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Comment validation
export const validateCommentInsert = (comment: CommentInsert): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!comment.content) {
    errors.push({ field: 'content', message: 'Comment content is required' });
  } else {
    if (comment.content.length < 1) {
      errors.push({ field: 'content', message: 'Comment cannot be empty' });
    }
    if (comment.content.length > 500) {
      errors.push({ field: 'content', message: 'Comment must be no more than 500 characters long' });
    }
  }

  if (!comment.user_id) {
    errors.push({ field: 'user_id', message: 'User ID is required' });
  }

  if (!comment.post_id) {
    errors.push({ field: 'post_id', message: 'Post ID is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateCommentUpdate = (comment: CommentUpdate): ValidationResult => {
  const errors: ValidationError[] = [];

  if (comment.content !== undefined) {
    if (!comment.content) {
      errors.push({ field: 'content', message: 'Comment content is required' });
    } else {
      if (comment.content.length < 1) {
        errors.push({ field: 'content', message: 'Comment cannot be empty' });
      }
      if (comment.content.length > 500) {
        errors.push({ field: 'content', message: 'Comment must be no more than 500 characters long' });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// UUID validation
export const validateUUID = (id: string, fieldName: string = 'id'): ValidationResult => {
  const errors: ValidationError[] = [];
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!id) {
    errors.push({ field: fieldName, message: `${fieldName} is required` });
  } else if (!uuidRegex.test(id)) {
    errors.push({ field: fieldName, message: `${fieldName} must be a valid UUID` });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Pagination validation
export const validatePagination = (limit?: number, offset?: number): ValidationResult => {
  const errors: ValidationError[] = [];

  if (limit !== undefined) {
    if (limit < 1) {
      errors.push({ field: 'limit', message: 'Limit must be at least 1' });
    }
    if (limit > 100) {
      errors.push({ field: 'limit', message: 'Limit cannot exceed 100' });
    }
  }

  if (offset !== undefined && offset < 0) {
    errors.push({ field: 'offset', message: 'Offset cannot be negative' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Search query validation
export const validateSearchQuery = (query: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!query) {
    errors.push({ field: 'query', message: 'Search query is required' });
  } else {
    if (query.length < 2) {
      errors.push({ field: 'query', message: 'Search query must be at least 2 characters long' });
    }
    if (query.length > 100) {
      errors.push({ field: 'query', message: 'Search query must be no more than 100 characters long' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
