import React, { useRef } from 'react';
import { errorReporter } from '@gotecq/access';
import { AutoFields, BaseForm, SubmitField } from '@gotecq/form';

type AddSubmitterInfoFormProps = {
    submitterInfo?: Record<string, any>,
    handleSubmitInfo: (model: any) => Promise<void>
}

export const AddSubmitterInfoForm = ({
    submitterInfo,
    handleSubmitInfo,
}: AddSubmitterInfoFormProps) => {
    const formRef = useRef<any>();
    return (
        <BaseForm
            handleSubmit={handleSubmitInfo}
            formRef={formRef}
            model={submitterInfo}
            useLoadingOverlay={false}
            handleSubmitFail={(e) => errorReporter(e)}
            schema={{
                type: 'object',
                title: 'Submit Information',
                required: ['submitter_name', 'submitter_email'],
                properties: {
                    submitter_name: {
                        title: 'Your Name',
                        type: 'string',
                        className: 'no-spacing-top',
                        column: {
                            span: 12,
                        },
                    },
                    submitter_email: {
                        title: 'Your Email Address',
                        className: 'no-spacing-top',
                        type: 'string',
                        pattern: '^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w+)+$',
                        column: {
                            span: 12,
                        },
                    },
                },
            }}
            className='submit-info-form'
        >
            <AutoFields fields={['submitter_name', 'submitter_email']} gutter={10} />
            <div className='btn-submit'>
                <SubmitField shape='round' value='Upload' />
            </div>
        </BaseForm>
    );
};