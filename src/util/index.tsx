import { ILayoutService } from '@gotecq/layout';
import { errorReporter, getHTTPError } from '@gotecq/access';
import { convertTime } from '@gotecq/utils';
export * from './format-singular-plural';

export const disallowDateinFuture = (current) => {
    return current && current > new Date();
};

export const searchParam = (key: string, layout: ILayoutService, fallback?: any) => {
    const param = {
        primary: layout.getParam('primary'),
        secondary: layout.getParam('secondary'),
        extension: layout.getParam('extension'),
    };

    let foundValue;
    Object.keys(param)
        .some(panelKey => {
            const panelParam = param[panelKey] ?? {};

            if (panelParam[key] !== undefined) {
                foundValue = panelParam[key];
                return true;
            }
            return false;
        });
    return foundValue === undefined ? fallback : foundValue;
};

export const searchId = (idKey: string, layout: ILayoutService, fallback?: any) => {
    const param = {
        primary: layout.getParam('primary'),
        secondary: layout.getParam('secondary'),
        extension: layout.getParam('extension'),
    };

    let foundValue;
    Object.keys(param)
        .some(panelKey => {
            const panelParam = (param[panelKey] ?? {}) as Record<string, any>;

            Object.keys(panelParam)
                .some(paramKey => {
                    if (panelParam[`${paramKey}Type`] === idKey) {
                        foundValue = panelParam[paramKey];
                        return true;
                    }
                    return false;
                });
            if (foundValue !== undefined) return true;
            return false;
        });
    return foundValue === undefined ? fallback : foundValue;
};

export const arrayToMap = <D extends Record<string, any>>(arr: D[], key: keyof D) => {
    const retObj: Record<string, D> = {};
    arr.forEach(item => {
        retObj[item[key]] = item;
    });

    return retObj;
};

export const promiseArrayToMap = async <D extends Record<string, any>>(arr: Promise<D[]>, key: keyof D) => {
    const retObj: Record<string, D> = {};
    const fulfilledArray = await arr;
    fulfilledArray.forEach(item => {
        retObj[item[key]] = item;
    });

    return retObj;
};

export const searchFilter = (filterArray: Record<string, any>[], key: string) => {
    if (!Array.isArray(filterArray)) return undefined;
    const target = filterArray.filter(entry => Object.keys(entry)[0] === key)[0];
    return target != null ? Object.entries(target)[0] : undefined;
};

export const errorNotification = (err: any, message?: string) => {
    if (!err) return;
    const description = err?.response?.data?.message ?? err?.data?.message;
    const errorCode = getHTTPError(err);
    if (errorCode.code !== '004') {
        errorReporter(err, { type: 'notification', description: description, message: message });
    }

};

// export const validateFrequency = (frequency, type, textError) => {
//     let error = '';
//     const listFrequency = frequency.split(' ');
//     const month = listFrequency[3];
//     const day = listFrequency[2];
//     const hour = listFrequency[1];
//     const weekday = listFrequency[4];
//     switch (type) {
//         case '@yearly':
//             if (hour === '*' || day === '*' || month === '*') {
//                 error = textError;
//             } else {
//                 const monthHas30 = [4, 6, 9, 11];
//                 const monthHas31 = [1, 3, 5, 7, 8, 10, 12];
//                 if (Number(month) === 2 && Number(day) > 29) {
//                     error = `February doesn't have ${day} days`;
//                 } else if (monthHas30.includes(Number(month)) && Number(day) > 30) {
//                     error = `This month doesn't have ${day} days`;
//                 } else if (monthHas31.includes(Number(month)) && Number(day) > 31) {
//                     error = `This month doesn't have ${day} days`;
//                 } else {
//                     error = '';
//                 }
//             }
//             break;
//         case '@monthly':
//             if (hour === '*' || day === '*') {
//                 error = textError;
//             } else {
//                 error = '';
//             }
//             break;
//         case '@weekly':
//             if (hour === '*' || weekday === '*') {
//                 error = textError;
//             } else {
//                 error = '';
//             }
//             break;
//         case '@daily':
//             if (hour === '*') {
//                 error = textError;
//             } else {
//                 error = '';
//             }
//             break;
//         default:
//             break;
//     }

//     return error;
// };


// minute hour dayofmonth month dayofweek
export const handleDataFrequency = (frequency, type) => {
    const frequencyList = frequency.split(' ');
    const month = Number(frequencyList[3]);
    const day = Number(frequencyList[2]);
    const hour = Number(frequencyList[1]);
    const weekday = Number(frequencyList[4]);
    if (String(type) === '@yearly') {
        const { monthUtc, dayUtc, hourUtc }: any = convertTime(month, day, hour, weekday, type, 'toUTC');
        return {
            month: monthUtc,
            day: dayUtc,
            hour: hourUtc,
            minute: 0,
        };
    } else if (String(type) === '@monthly') {
        const { dayUtc, hourUtc }: any = convertTime(month, day, hour, weekday, type, 'toUTC');
        return {
            day: dayUtc,
            hour: hourUtc,
            minute: 0,
        };
    }
    else if (String(type) === '@weekly') {
        const { weekdayUtc, hourUtc }: any = convertTime(month, day, hour, weekday, type, 'toUTC');
        return {
            weekday: weekdayUtc,
            hour: hourUtc,
            minute: 0,
        };
    } else {
        const { hourUtc }: any = convertTime(month, day, hour, weekday, type, 'toUTC');
        return {
            hour: hourUtc,
            minute: 0,
        };
    }
};

export const getTimeZone = () => {
    const timezone = new Date().getTimezoneOffset();
    const hourTimezone = (Number(timezone) / 60) * -1;
    return `(UTC${(hourTimezone > 0 ? `+${hourTimezone}` : hourTimezone)})`;
};


export const handleResponse = (allReponses: any, listItem: any, titleName: string) => {
    let listItemIdError = [] as string[];
    const allResults = allReponses.map((item: any) => {
        if (item.status === 'fulfilled') {
            const itemIdSuccess = item?.value?._resp?.[0]?.data?._id;
            return ({
                result: 'Success',
                _id: itemIdSuccess,
                name: listItem.find(item => item._id === itemIdSuccess)?.[titleName],
                reason: '',
            });
        }
        else {
            const urlSplit = (item?.reason?.config?.url).split('/');
            const itemIdError = urlSplit?.[urlSplit?.length - 1];
            listItemIdError.push(itemIdError);
            return ({
                reason: item?.reason?.response?.data?.message ?? item?.reason?.message,
                result: 'Failed',
                _id: itemIdError,
                name: listItem.find(item => item._id === itemIdError)?.[titleName],
            });
        };
    });

    return allResults;
};