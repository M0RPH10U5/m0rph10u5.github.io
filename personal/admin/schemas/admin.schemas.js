import { LogisticsSchema } from './logistics.schema.js';
import { LogsSchema } from './logs.schema.js';
import { FleetSchema } from './fleet.schema.js';
import { MembersSchema } from './members.schema.js';
import { OverviewSchema } from './overview.schema.js';

export const Schemas = {
    'overview.json': { type: "overview" },
    'fleet.json': { type: "cards" },
    'members.json': { type: "cards" },
    'logs.json': { type: "logs" },
    'polaris.json': { type: "logistics" },
    'idris.json': { type: "logistics" }
};