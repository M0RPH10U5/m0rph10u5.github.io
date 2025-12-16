import { LogisticsSchema } from './logistics.schema.js';
import { LogsSchema } from './logs.schema.js';
import { FleetSchema } from './fleet.schema.js';
import { MembersSchema } from './members.schema.js';
import { OverviewSchema } from './overview.schema.js';

export const Schemas = {
    'overview.json': OverviewSchema,
    'fleet.json': FleetSchema,
    'members.json': MembersSchema,
    'logs.json': LogsSchema
    'polaris.json': LogisticsSchema,
    'idris.json': LogisticsSchema
};