import { createConfigGetter, getBuildConfig } from '@gotecq/config';

export const { getConfig, loadAsyncConfig } = createConfigGetter();

export const BASE_URL = getBuildConfig('BASE_URL');

export const API_URL = getConfig('platform.main_api');
export const PLATFORM_API_URL = getConfig('platform.platform_api');
export const APP_URL = getConfig('platform.landing_page_url');


export const APPLICATION_PARAM = 'datapack-management';
export const ACTION_PARAM = 'scheduler_retrieve_data';