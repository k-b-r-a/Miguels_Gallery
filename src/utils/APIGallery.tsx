import { useState, useEffect } from 'react';

export function useApiData<T>(url: string) {
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setData(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [url]);

    return data;
}