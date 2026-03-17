const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File is too large (max 5MB).';
  }
  const type = file.type?.toLowerCase();
  const allowed = type && (type.startsWith('image/') || ALLOWED_TYPES.includes(type));
  if (!allowed) {
    return 'Please choose an image file (JPEG, PNG, GIF, or WebP).';
  }
  return null;
}
