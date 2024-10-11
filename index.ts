import _ from 'lodash-es';

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
    createdAtDates.sort((a, b) => a - b);
    const filteredCreatedAtDates = createdAtDates.filter(Boolean);
    return {
        start: filteredCreatedAtDates[0],
        end: filteredCreatedAtDates[filteredCreatedAtDates.length - 1],
    };
}

async function main() {
  const transaction = await getTransactionStartAndEndTime('a8f2446f68d8640b112fae2503189a4cf3d8e8cac6fe6a8c7d002d6735db5809');
  console.log(transaction);
}

main().catch(console.error);
