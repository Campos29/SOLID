import { describe, expect, it } from 'vitest';
import {
  createReviewBodySchema,
  createReviewParamsSchema,
} from '../../../src/interfaces/schemas/reviewSchemas';

describe('review schemas', () => {
  it('accepts a valid appointment review payload', () => {
    const params = createReviewParamsSchema.parse({
      appointmentId: '1f8f1f66-df4c-4dc9-87a7-71a62fdf13fb',
    });
    const body = createReviewBodySchema.parse({
      rating: 5,
      comment: '  Great service  ',
    });

    expect(params.appointmentId).toBe('1f8f1f66-df4c-4dc9-87a7-71a62fdf13fb');
    expect(body).toEqual({
      rating: 5,
      comment: 'Great service',
    });
  });

  it('rejects reviews outside the supported rating range', () => {
    expect(() =>
      createReviewBodySchema.parse({
        rating: 6,
      }),
    ).toThrow('Rating must be at most 5');
  });
});
