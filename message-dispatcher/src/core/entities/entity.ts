import { CommonProps } from './common-props';
import { UniqueEntityID } from './unique-id';

export abstract class Entity<T> {
  protected readonly props: T;
  private readonly _id: UniqueEntityID;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: T, commonProps?: CommonProps) {
    this.props = props;
    this._id = commonProps?.id ?? new UniqueEntityID();
    this._createdAt = commonProps?.createdAt ?? new Date();
    this._updatedAt = commonProps?.updatedAt ?? new Date();
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected hasChanged(): void {
    this._updatedAt = new Date();
  }
}
