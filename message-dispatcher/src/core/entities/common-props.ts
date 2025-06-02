import { UniqueEntityID } from './unique-id';

export type CommonProps = {
  id: UniqueEntityID;
  createdAt: Date;
  updatedAt: Date;
};

export function makeCommonProps(data: any): CommonProps {
  return {
    id: new UniqueEntityID(data.id),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
