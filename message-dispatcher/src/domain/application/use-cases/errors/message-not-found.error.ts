export class MessageNotFoundError extends Error {
  constructor(message?: string) {
    super(message || 'Message not found');
  }
}
