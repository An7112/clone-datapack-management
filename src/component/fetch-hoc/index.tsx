import React, { useEffect, useState } from 'react';
import { DataProfile } from '@/access';

type FetchHOCProps<Data extends any = any, ProcessedData extends any = Data> = {
    isLoading: boolean,
    data?: Data,
    processedData?: ProcessedData,
}
export type FetchHOC<Data extends any = any, ProcessedData extends any = Data> = {
    url: string,
    children: React.ComponentType<FetchHOCProps<Data, ProcessedData>>,
    processData?: (data: Data) => ProcessedData,
    defaultData?: ProcessedData,
}
export const FetchHOC = <Data extends any = any, ProcessedData extends any = Data>({
    children: Comp,
    url,
    processData,
    defaultData,
}: FetchHOC<Data, ProcessedData>) => {
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState<Data | undefined>(undefined);
    const [processedData, setProcessedData] = useState<ProcessedData | undefined>(undefined);
    useEffect(() => {
        let relevant = true;
        setLoading(true);
        (async () => {
            try {
                const resp = await DataProfile.Get(url);

                if (relevant) {
                    setData(resp?.data);
                    processData && setProcessedData(processData(resp?.data));
                    setLoading(false);
                }
            } catch (e) {
                if (relevant) {
                    if (defaultData !== undefined) setProcessedData(defaultData);
                    setLoading(false);
                }
            }
        })();

        return () => { relevant = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    return <Comp isLoading={isLoading} data={data} processedData={processedData} />;
};