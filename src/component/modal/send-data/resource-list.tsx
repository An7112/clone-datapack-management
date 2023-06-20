import React, { useEffect } from 'react';
import { Select } from 'antd';
import { fromJS } from 'immutable';
import { CaretDownOutlined, FileTextOutlined, LinkOutlined } from '@ant-design/icons';

import { FormatDate, FormatFileSize } from '@gotecq/format';
import { useField, wrapField } from '@gotecq/form';
import { PaginatedDefaultHeader, OldPaginatedTable } from '@gotecq/paginated';

import { URIIcon } from '@/asset';
import { ResourceModel } from '@/models';
import { QueryAPI } from '@/access';
import './style.scss';

export function ResourceList({
    name,
    resourceListRef,
    datapackId,
    filter,
    setFilter,
    setResourceType,
    resourceType,
    setSelectedItem,
    selectedItem,
}: any) {

    const [propsField] = useField(name, {});

    const onChangeDropdownType = (value: string) => {
        setFilter(currFilter => {
            const filteredOldKey = currFilter.map(item => {
                if (!item.kind) return item;
                return {};
            });
            return [...filteredOldKey, { kind: value }];
        });

        setResourceType(value as any);
    };


    const TableHeader = (props) => {
        return <PaginatedDefaultHeader type="transparent" className="send-data-custom-header" {...props}>
            {({ renderSearchBox }) => {
                return (
                    <div className='ant-form-item-label select-data'>
                        <label className='select-data-label'>
                            Select Data to send
                            <span className="ant-form-item-required-asterisk">*</span>
                        </label>
                        <div className='title-suffix'>
                            <Select
                                className='resource-list--dropdown'
                                allowClear
                                onChange={onChangeDropdownType}
                                suffixIcon={<CaretDownOutlined />}
                                value={resourceType}
                                placeholder="Type"
                            >
                                <Select.Option key="FILE" value="FILE">
                                    File
                                </Select.Option>
                                <Select.Option key="FILE_LINK" value="FILE_LINK">
                                    Link
                                </Select.Option>
                                <Select.Option key="FILE_URI" value="FILE_URI">
                                    URI
                                </Select.Option>
                            </Select>
                            {renderSearchBox?.()}
                        </div>
                    </div>
                );
            }}
        </PaginatedDefaultHeader>;
    };

    useEffect(() => {
        propsField?.onChange(selectedItem);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItem?.length]);

    return (wrapField({ ...propsField, className: 'resource-list-field-custom', requiredInternalField: false },
        <div>
            <OldPaginatedTable<ResourceModel>
                className='resource-table'
                batchMode={true}
                ref={resourceListRef}
                onSelectedItemChange={(data, selectedItem) => {
                    setSelectedItem(selectedItem);
                    if (!selectedItem?.[0]) {
                        propsField?.onChange(undefined);
                    }
                    else {
                        propsField?.onChange(selectedItem);
                    }
                }}
                filter={fromJS([
                    ...filter ?? [],
                ]) as any}
                HeaderComp={TableHeader}
                defaultSelectedItem={selectedItem}
                source={QueryAPI.datapack.resource.all(datapackId)}
                key={selectedItem?.join['-']}
                pageSize={5}
                fields={{
                    resource: {
                        label: 'Resource',
                        component: ({ row }) => {
                            const Icon = {
                                FILE: <FileTextOutlined />,
                                FILE_LINK: <LinkOutlined />,
                                FILE_URI: <URIIcon />,
                            };

                            return <>
                                {Icon[row?.kind ?? 'FILE']}
                                <span className='truncate resource-display' title={row?.display}>{row?.display}</span>
                            </>;
                        },
                    },
                    path: {
                        label: 'Path',
                        component: ({ data }) => <div className='truncate'>{data}</div>,
                    },
                    _updated: {
                        label: 'Last Modified',
                        component: ({ data }) => <FormatDate value={data} type='calendar' />,
                        sortable: false,
                    },
                    length: {
                        label: 'File Size',
                        component: ({ data }) => <FormatFileSize value={data} />,
                    },
                }}
                headers={['batch_tool', 'resource', 'path', '_updated', 'length']}
            />
        </div>,

    ));
}
