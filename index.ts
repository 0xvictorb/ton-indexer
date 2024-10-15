import _ from 'lodash-es';

const findStatus = (obj: any): boolean => {
    if (typeof obj === 'object') {
        for (const key in obj) {
            if (key === 'success') {
                return Boolean(obj[key]);
            } else if (typeof obj[key] === 'object') {
                const result = findStatus(obj[key]);
                if (result === false) {
                    return false;
                }
            }
        }
    }
    return true;
};

const getTransactionStartAndEndTime = async (hash: string) => {
    const traces = await fetch(`https://tonapi.io/v2/traces/${hash}`);
    const tracesJson = await traces.json();

    const createdAtDates: number[] = [];
    const findCreatedAt = (obj: any) => {
        if (typeof obj === 'object') {
            for (const key in obj) {
                if (key === 'created_at') {
                    createdAtDates.push(obj[key]);
                } else {
                    findCreatedAt(obj[key]);
                }
            }
        }
    };
    findCreatedAt(tracesJson);
    const isSuccess = findStatus(tracesJson);

    createdAtDates.sort((a, b) => a - b);
    const filteredCreatedAtDates = createdAtDates.filter(Boolean);
    return {
        start: filteredCreatedAtDates[0],
        end: filteredCreatedAtDates[filteredCreatedAtDates.length - 1],
        status: isSuccess ? 'success' : 'failed',
    };
}

async function main() {
  const transaction = await getTransactionStartAndEndTime('552216c6160ad52b6fda74a9cc4f3c40cd42869062432efb9e555606018751e1');
  console.log(transaction);
}

main().catch(console.error);
