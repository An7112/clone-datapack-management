import { API_URL } from '@/config';
import { createRequestor, DataAccessWithHook } from '@gotecq/access';

export const DataProfile = new DataAccessWithHook('data', API_URL());

export const Requestor = createRequestor();