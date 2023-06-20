import React, { useState } from 'react';
import { ActionEdit, ComposeHeader, S8Button, S8Modal } from '@gotecq/s8-component';
import { AutoFields, BaseForm, ErrorsField, LongTextField, SubmitField } from '@gotecq/form';
import schema from './schema.json';
import { CommandAPI, QueryAPI } from '@/access';
import { actionSuccessReporter, errorReporter } from '@gotecq/access';

type EditResourceLink = {
    datapackId: string
    resourceId: string
    disable?: boolean
    onSubmitSucess: () => void
}

export function EditResourceFile({ datapackId, resourceId, onSubmitSucess, disable = false }: EditResourceLink) {
    const [visible, setVisible] = useState(false);

    const handleSubmitSucess = () => {
        onSubmitSucess();
        actionSuccessReporter({
            action: 'Update',
            target: 'File',
        });
        setVisible(false);
    };

    const handleSubmitFail = (e) => {
        errorReporter(e, {
            message: e?.data?.message ?? 'Update file failed!',
        });
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <ActionEdit disabled={disable} onClick={() => setVisible(true)} theme='major' />
            <S8Modal
                visible={visible}
                title='Edit File Information'
                className='edit-file-modal'
                onCancel={() => setVisible(false)}
                destroyOnClose
                nopadding
            >
                <BaseForm
                    schema={schema}
                    command={CommandAPI.datapack.resource.update(datapackId)}
                    query={QueryAPI.datapack.resource.single(datapackId, resourceId)}
                    handleSubmitSuccess={handleSubmitSucess}
                    handleSubmitFail={handleSubmitFail}
                >
                    <AutoFields fields={['display', 'path']} />
                    <LongTextField name="description" rows={3} />
                    <ErrorsField />
                    <ComposeHeader footer type="tertiary">
                        <ComposeHeader.HeaderItem>
                            <S8Button onClick={() => setVisible(false)}>Cancel</S8Button>
                        </ComposeHeader.HeaderItem>
                        <ComposeHeader.HeaderItem right>
                            <SubmitField value={'Save'} />
                        </ComposeHeader.HeaderItem>
                    </ComposeHeader>
                </BaseForm>
            </S8Modal>
        </div>
    );
}