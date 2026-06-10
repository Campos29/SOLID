export type ReviewProps = {
  id: string;
  appointmentId: string;
  providerId: string;
  clientId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
};

export type CreateReviewInput = {
  id: string;
  appointmentId: string;
  providerId: string;
  clientId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
};

export class Review {
  private constructor(private readonly props: ReviewProps) {}

  static create(input: CreateReviewInput): Review {
    ensureFilled(input.id, 'Review id');
    ensureFilled(input.appointmentId, 'Review appointment id');
    ensureFilled(input.providerId, 'Review provider id');
    ensureFilled(input.clientId, 'Review client id');
    ensureRating(input.rating);
    ensureComment(input.comment);

    return new Review({
      ...input,
      comment: normalizeComment(input.comment),
      createdAt: input.createdAt ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get appointmentId(): string {
    return this.props.appointmentId;
  }

  get providerId(): string {
    return this.props.providerId;
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get rating(): number {
    return this.props.rating;
  }

  get comment(): string | undefined {
    return this.props.comment;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}

function ensureFilled(value: string, fieldName: string): void {
  if (!value.trim()) {
    throw new Error(`${fieldName} is required`);
  }
}

function ensureRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Review rating must be an integer between 1 and 5');
  }
}

function ensureComment(comment: string | undefined): void {
  if (comment !== undefined && comment.trim().length > 1000) {
    throw new Error('Review comment must not exceed 1000 characters');
  }
}

function normalizeComment(comment: string | undefined): string | undefined {
  if (comment === undefined) {
    return undefined;
  }

  const trimmed = comment.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
