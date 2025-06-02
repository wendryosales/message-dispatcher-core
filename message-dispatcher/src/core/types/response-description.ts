export enum ResponseDescription {
  OK = 'The request was successful',
  CREATED = 'The request was successful and a resource was created',
  BAD_REQUEST = 'The request was malformed or invalid',
  NO_CONTENT = 'The request was successful and the response body is empty',
  NOT_FOUND = 'The requested resource was not found',
  UNAUTHORIZED = 'The request was not authorized',
  UNPROCESSABLE_ENTITY = 'The server understood the request and the syntax is correct, but could not fulfill the request',
  INTERNAL_SERVER_ERROR = 'The server encountered an unexpected condition that prevented it from fulfilling the request',
  CONFLICT = 'The request could not be completed due to a conflict with the current state of the resource',
}
