import React, { useState, useEffect } from 'react';
import { useField, wrapField } from '@gotecq/form';
import { Select } from 'antd';
import { handleDataFrequency } from '@/util';
import { Frequency } from '@/models';
import { ActionButton } from '@gotecq/s8-component';
import { CloseIcon } from '@/asset';
import { convertTime } from '@gotecq/utils';
import './style.scss';

const handleFrequencyFromServer = (frequency: Frequency) => {
    const { month, day, weekday, hour } = frequency;

    if (month !== null && day !== null && hour !== null) {
        const { monthUtc, dayUtc, hourUtc }: any = convertTime(month, day, hour, 0, '@yearly', 'toTimeZone');
        return {
            type: '@yearly',
            value: {
                hour: hourUtc,
                day: dayUtc,
                month: monthUtc,
            },
        };
    } else if (day !== null && hour !== null) {
        const { dayUtc, hourUtc }: any = convertTime(0, day, hour, 0, '@monthly', 'toTimeZone');
        return {
            type: '@monthly',
            value: {
                hour: hourUtc,
                day: dayUtc,
            },
        };
    } else if (weekday !== null && hour !== null) {
        const { weekdayUtc, hourUtc }: any = convertTime(0, 0, hour, weekday, '@weekly', 'toTimeZone');
        return {
            type: '@weekly',
            value: {
                hour: hourUtc,
                weekday: weekdayUtc,
            },
        };
    } else if (hour !== null) {
        const { hourUtc }: any = convertTime(0, 0, hour, 0, '@daily', 'toTimeZone');
        return {
            type: '@daily',
            value: {
                hour: hourUtc,
            },
        };
    } else {
        return {
            type: '',
            value: {},
        };
    }
};

export type FrequencyProps = {
    name: string;
}

export function FrequencyField({
    name,
}: FrequencyProps) {
    const [propsField] = useField(name, {});
    const [type, setType] = useState('@yearly');

    const [valueMonth, setValueMonth] = useState<any>('1');
    const [valueDayOfMonth, setValueDayOfMonth] = useState('1');
    const [valueDayofWeek, setValueDayofWeek] = useState('0');
    const [valueHour, setValueHour] = useState('0');

    useEffect(() => {
        const frequencyAndType = handleFrequencyFromServer(propsField.value ?? {} as any);
        setType(frequencyAndType.type);
        setValueMonth(frequencyAndType.value.month ?? '1');
        setValueDayOfMonth(frequencyAndType.value.day ?? '1');
        setValueDayofWeek(frequencyAndType.value.weekday ? frequencyAndType.value.weekday : '0');
        setValueHour(frequencyAndType.value.hour ? frequencyAndType.value.hour : '0');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        switch (type) {
            case '@yearly':
                if (!valueMonth || !valueDayOfMonth || !valueHour) {
                    propsField?.onChange(undefined);
                } else {
                    propsField?.onChange(handleDataFrequency(`* ${valueHour} ${valueDayOfMonth} ${valueMonth} *`, type));
                }
                break;
            case '@monthly':
                if (!valueDayOfMonth || !valueHour) {
                    propsField?.onChange(undefined);
                } else {
                    propsField?.onChange(handleDataFrequency(`* ${valueHour} ${valueDayOfMonth} * *`, type));
                }
                break;
            case '@weekly':
                if (!valueDayofWeek || !valueHour) {
                    propsField?.onChange(undefined);
                } else {
                    propsField?.onChange(handleDataFrequency(`* ${valueHour} * * ${valueDayofWeek}`, type));
                }
                break;
            case '@daily':
                if (!valueHour) {
                    propsField?.onChange(undefined);
                } else {
                    propsField?.onChange(handleDataFrequency(`* ${valueHour} * * *`, type));
                }
                break;
            default:
                break;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valueMonth, valueDayOfMonth, valueHour, valueDayofWeek, type]);


    return wrapField({ ...propsField, className: 'frequency-wrap-field' }, (
        <div className={'frequency'} >
            <div className='custom-period-container'>
                <span className='label-every'>Every</span>
                <Select className='custom-period' value={type}
                    onChange={(e) => {
                        setType(e);
                        setValueMonth('1');
                        setValueDayOfMonth('1');
                        setValueDayofWeek('0');
                        setValueHour('0');
                    }}>
                    <Select.Option value="@yearly">Year</Select.Option>
                    <Select.Option value="@monthly">Month</Select.Option>
                    <Select.Option value="@weekly">Week</Select.Option>
                    <Select.Option value="@daily">Day</Select.Option>
                </Select>
            </div>
            {
                type === '@yearly' ?
                    <>
                        <SelectMonth value={valueMonth} onChangeMonth={(value) => setValueMonth(value)} />
                        <SelectDayOfMonth
                            month={valueMonth}
                            value={valueDayOfMonth}
                            onChangeDayOfMonth={(value) => setValueDayOfMonth(value)}
                        />
                        <SelectHour value={valueHour} onChangeHour={(value) => setValueHour(value)} />
                    </> : type === '@monthly' ?
                        <>
                            <SelectDayOfMonth
                                month={valueMonth}
                                value={valueDayOfMonth}
                                onChangeDayOfMonth={(value) => setValueDayOfMonth(value)}
                            />
                            <SelectHour value={valueHour} onChangeHour={(value) => setValueHour(value)} />
                        </> : type === '@weekly' ?
                            <>
                                <SelectDayOfWeek value={valueDayofWeek} onChangeDayOfMonth={(value) => setValueDayofWeek(value)} />
                                <SelectHour value={valueHour} onChangeHour={(value) => setValueHour(value)} />
                            </> : <>
                                <SelectHour value={valueHour} onChangeHour={(value) => setValueHour(value)} />
                            </>
            }
            <ActionButton className='icon-close' icon={<CloseIcon />} theme="info"
                onClick={(e) => {
                    e.preventDefault();
                    setValueMonth('1');
                    setValueDayOfMonth('1');
                    setValueDayofWeek('0');
                    setValueHour('0');
                }}
            />

        </div>
    ));
}


const SelectMonth = ({ onChangeMonth, value }) => {
    return <div className='frequency-select-container'>
        <span className='prefix'>in</span>
        <Select
            className='frequency-select month'
            virtual={false}
            allowClear
            defaultValue={value}
            value={!value ? 'every month' : value.toString()}
            onChange={(value) => onChangeMonth(value)}
            options={[
                { value: '1', label: 'Jan', fullName: 'January' },
                { value: '2', label: 'Feb', fullName: 'February' },
                { value: '3', label: 'Mar', fullName: 'March' },
                { value: '4', label: 'Apr', fullName: 'April' },
                { value: '5', label: 'May', fullName: 'May' },
                { value: '6', label: 'Jun', fullName: 'June' },
                { value: '7', label: 'Jul', fullName: 'July' },
                { value: '8', label: 'Aug', fullName: 'August' },
                { value: '9', label: 'Sep', fullName: 'September' },
                { value: '10', label: 'Oct', fullName: 'October' },
                { value: '11', label: 'Nov', fullName: 'November' },
                { value: '12', label: 'Dec', fullName: 'December' },
            ]}
        />
    </div>;
};

const SelectDayOfMonth = ({ onChangeDayOfMonth, value, month }) => {
    const monthHas31 = [1, 3, 5, 7, 8, 10, 12];
    return <div className='frequency-select-container'>
        <span className='prefix'>on</span>
        <Select
            className='frequency-select day-of-month'
            allowClear
            virtual={false}
            defaultValue={value}
            value={!value ? 'every day of the month' : value}
            onChange={(value) => onChangeDayOfMonth(value)}
            options={monthHas31.includes(Number(month)) ? [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
                { value: '7', label: '7' },
                { value: '8', label: '8' },
                { value: '9', label: '9' },
                { value: '10', label: '10' },
                { value: '11', label: '11' },
                { value: '12', label: '12' },
                { value: '13', label: '13' },
                { value: '14', label: '14' },
                { value: '15', label: '15' },
                { value: '16', label: '16' },
                { value: '17', label: '17' },
                { value: '18', label: '18' },
                { value: '19', label: '19' },
                { value: '20', label: '20' },
                { value: '21', label: '21' },
                { value: '22', label: '22' },
                { value: '23', label: '23' },
                { value: '24', label: '24' },
                { value: '25', label: '25' },
                { value: '26', label: '26' },
                { value: '27', label: '27' },
                { value: '28', label: '28' },
                { value: '29', label: '29' },
                { value: '30', label: '30' },
                { value: '31', label: '31' },
            ] : Number(month) === 2 ? [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
                { value: '7', label: '7' },
                { value: '8', label: '8' },
                { value: '9', label: '9' },
                { value: '10', label: '10' },
                { value: '11', label: '11' },
                { value: '12', label: '12' },
                { value: '13', label: '13' },
                { value: '14', label: '14' },
                { value: '15', label: '15' },
                { value: '16', label: '16' },
                { value: '17', label: '17' },
                { value: '18', label: '18' },
                { value: '19', label: '19' },
                { value: '20', label: '20' },
                { value: '21', label: '21' },
                { value: '22', label: '22' },
                { value: '23', label: '23' },
                { value: '24', label: '24' },
                { value: '25', label: '25' },
                { value: '26', label: '26' },
                { value: '27', label: '27' },
                { value: '28', label: '28' },
            ] : [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
                { value: '7', label: '7' },
                { value: '8', label: '8' },
                { value: '9', label: '9' },
                { value: '10', label: '10' },
                { value: '11', label: '11' },
                { value: '12', label: '12' },
                { value: '13', label: '13' },
                { value: '14', label: '14' },
                { value: '15', label: '15' },
                { value: '16', label: '16' },
                { value: '17', label: '17' },
                { value: '18', label: '18' },
                { value: '19', label: '19' },
                { value: '20', label: '20' },
                { value: '21', label: '21' },
                { value: '22', label: '22' },
                { value: '23', label: '23' },
                { value: '24', label: '24' },
                { value: '25', label: '25' },
                { value: '26', label: '26' },
                { value: '27', label: '27' },
                { value: '28', label: '28' },
                { value: '29', label: '29' },
                { value: '30', label: '30' },
            ]
            }
        />
    </div>;
};

const SelectHour = ({ onChangeHour, value }) => {
    return <div className='frequency-select-container'>
        <span className='prefix'>at</span>
        <Select
            className='frequency-select hour'
            allowClear
            virtual={false}
            onChange={(value) => onChangeHour(value)}
            defaultValue={value}
            value={!value ? 'every hour' : value}
            options={[
                { value: '0', label: '0' },
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
                { value: '7', label: '7' },
                { value: '8', label: '8' },
                { value: '9', label: '9' },
                { value: '10', label: '10' },
                { value: '11', label: '11' },
                { value: '12', label: '12' },
                { value: '13', label: '13' },
                { value: '14', label: '14' },
                { value: '15', label: '15' },
                { value: '16', label: '16' },
                { value: '17', label: '17' },
                { value: '18', label: '18' },
                { value: '19', label: '19' },
                { value: '20', label: '20' },
                { value: '21', label: '21' },
                { value: '22', label: '22' },
                { value: '23', label: '23' },
            ]}
        />
    </div>;
};

const SelectDayOfWeek = ({ value, onChangeDayOfMonth }) => {
    return <div className='frequency-select-container'>
        <span className='prefix'>on</span>
        <Select
            className='frequency-select day-of-week'
            onChange={(value) => onChangeDayOfMonth(value)}
            virtual={false}
            allowClear
            defaultValue={value}
            value={!value ? 'every day of the week' : value}
            options={[
                { value: '0', label: 'Sun', fullName: 'Sunday' },
                { value: '1', label: 'Mon', fullName: 'Monday' },
                { value: '2', label: 'Tue', fullName: 'Tuesday' },
                { value: '3', label: 'Wed', fullName: 'Wednesday' },
                { value: '4', label: 'Thu', fullName: 'Thursday' },
                { value: '5', label: 'Fri', fullName: 'Friday' },
                { value: '6', label: 'Sat', fullName: 'Saturday' },
            ]}
        />
    </div>;
};