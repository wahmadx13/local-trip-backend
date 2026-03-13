import { SetMetadata } from '@nestjs/common';

export const ALLOW_UNSYNCED_AUTH_KEY = 'allowUnsyncedAuth';
export const AllowUnsyncedAuth = () =>
  SetMetadata(ALLOW_UNSYNCED_AUTH_KEY, true);
