import { MessageEntity, MessageStatus, MessageType } from './message.entity';

describe('MessageEntity', () => {
  const makeMessage = () => {
    return MessageEntity.create({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });
  };

  describe('create', () => {
    it('should create a new message with default values', () => {
      const message = makeMessage();

      expect(message.type).toBe(MessageType.HTTP);
      expect(message.destination).toBe('http://example.com');
      expect(message.payload).toEqual({ test: 'data' });
      expect(message.status).toBe(MessageStatus.PENDING);
      expect(message.attempts).toBe(0);
      expect(message.reason).toBeUndefined();
    });
  });

  describe('status management', () => {
    it('should mark message as processing', () => {
      const message = makeMessage();
      message.markProcessing();

      expect(message.status).toBe(MessageStatus.PROCESSING);
    });

    it('should mark message as success', () => {
      const message = makeMessage();
      message.markSuccess();

      expect(message.status).toBe(MessageStatus.SUCCESS);
    });

    it('should mark message as failed with reason', () => {
      const message = makeMessage();
      message.markFailed('Connection timeout');

      expect(message.status).toBe(MessageStatus.FAILED);
      expect(message.reason).toBe('Connection timeout');
    });
  });

  describe('retry logic', () => {
    it('should increment attempts counter', () => {
      const message = makeMessage();
      message.incrementAttempts();

      expect(message.attempts).toBe(1);
    });

    it('should allow automatic retry when attempts < 3 and status is not terminal', () => {
      const message = makeMessage();
      message.incrementAttempts();
      message.markProcessing();

      expect(message.canBeAutomaticallyRetried()).toBe(true);
    });

    it('should not allow automatic retry when attempts >= 3', () => {
      const message = makeMessage();
      for (let i = 0; i < 3; i++) {
        message.incrementAttempts();
      }

      expect(message.canBeAutomaticallyRetried()).toBe(false);
    });

    it('should not allow automatic retry when status is SUCCESS', () => {
      const message = makeMessage();
      message.markSuccess();

      expect(message.canBeAutomaticallyRetried()).toBe(false);
    });

    it('should not allow automatic retry when status is FAILED', () => {
      const message = makeMessage();
      message.markFailed('Error');

      expect(message.canBeAutomaticallyRetried()).toBe(false);
    });

    it('should allow manual retry when attempts >= 3 and status is FAILED', () => {
      const message = makeMessage();
      message.incrementAttempts();
      message.incrementAttempts();
      message.incrementAttempts();

      message.markFailed('Error');

      expect(message.canBeManuallyRetried()).toBe(true);
    });

    it('should not allow manual retry when conditions are not met', () => {
      const message = makeMessage();
      message.incrementAttempts();
      message.markProcessing();

      expect(message.canBeManuallyRetried()).toBe(false);
    });

    it('should reset message state when retrying', () => {
      const message = makeMessage();
      message.incrementAttempts();
      message.markFailed('Error');
      message.retry();

      expect(message.status).toBe(MessageStatus.PENDING);
      expect(message.attempts).toBe(0);
      expect(message.reason).toBeUndefined();
    });
  });

  describe('backoff timeout', () => {
    it('should calculate backoff timeout based on attempts', () => {
      const message = makeMessage();

      expect(message.backoffTimeout()).toBe(0); // Initial attempt

      message.incrementAttempts();
      expect(message.backoffTimeout()).toBe(4); // 1st retry

      message.incrementAttempts();
      expect(message.backoffTimeout()).toBe(8); // 2nd retry

      message.incrementAttempts();
      expect(message.backoffTimeout()).toBe(12); // 3rd retry
    });
  });
});
