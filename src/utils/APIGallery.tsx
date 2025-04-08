import { useState, useEffect } from 'react';

interface ApiDataFetcherProps {
    url: string;
}

export function ApiDataFetcher({ url }: ApiDataFetcherProps) {
    const [data, setData] = useState<[] | null>(null);

    useEffect(() => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Data fetched:', data);
                setData(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    return (
        data
    );
}