import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval('process transactions', { seconds: 1 }, internal.tradesAction.parseBlockTransactions);

export default crons; 
