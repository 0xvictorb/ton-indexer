import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// crons.interval('process transactions', { seconds: 5 }, internal.transactionsAction.parseBlockTransactions);
crons.interval('process transactions', { hours: 1 }, internal.transactionsAction.parseBlockTransactions);

export default crons;
