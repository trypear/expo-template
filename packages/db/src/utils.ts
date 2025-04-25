import type {
	AnyPgColumn,
	AnyPgTable,
	PgColumnBuilderBase,
	PgTableExtraConfigValue,
	PgTableWithColumns,
	UpdateDeleteAction,
} from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm/sql";
import { sql } from "drizzle-orm/sql";
import type { BuildColumns, BuildExtraConfigColumns } from "drizzle-orm";
import {
	pgTable,
	timestamp,
	customType,
} from "drizzle-orm/pg-core";

/**
 * Extracts the UUID portion after the table prefix
 */
function extractUuid(prefixedId: string): string {
	const parts = prefixedId.split('_');
	return parts.length > 1 ? parts.slice(1).join('_') : prefixedId;
}

/**
 * Type for prefixed identifiers with table name
 */
type PrefixedId<TableName extends string> = `${TableName}_${string}`;

/**
 * Creates a custom type that automatically prefixes UUIDs with the table name
 */
export function createPrefixedUuid<TableName extends string>(tableNameFn: () => TableName) {
	return customType<{
		data: string;
		driverData: PrefixedId<TableName>;
	}>({
		dataType: () => 'uuid',
		fromDriver: (val): PrefixedId<TableName> => {
			return `${tableNameFn()}_${val}` as PrefixedId<TableName>;
		},
		toDriver: (val) => {
			return extractUuid(val) as PrefixedId<TableName>;
		},
	});
}

/**
 * Creates a primary key column with auto-generated UUID and table name prefix
 */
export function pk<TableName extends string>(tableNameFn: () => TableName) {
	return createPrefixedUuid<TableName>(tableNameFn)()
		.primaryKey()
		.notNull()
		.default(sql`gen_random_uuid()`);
}

/**
 * Extracts the table name from a table object as a literal type
 */
type ExtractTableName<T> = T extends { _: { name: infer N extends string } } ? N : never;

/**
 * Creates a foreign key column referencing another table's ID with proper type prefixing
 * Uses lazy reference pattern to avoid circular dependencies
 */
export function fk<
	T extends { id: AnyPgColumn; _: { name: string } } & AnyPgTable
>(
	columnName: string,
	referencedTableFn: () => T,
	options?: {
		onDelete?: UpdateDeleteAction,
		onUpdate?: UpdateDeleteAction,
	}
) {
	// Extract the table name from the column name
	const getTableName = () => {
		return referencedTableFn()._.name;
	};

	return createPrefixedUuid<ExtractTableName<T>>(getTableName as () => ExtractTableName<T>)(columnName)
		.notNull()
		.references(() => referencedTableFn().id, {
			onDelete: options?.onDelete,
			onUpdate: options?.onUpdate
		});
}

/**
 * Creates a SQL fragment for case-insensitive string comparison
 */
export function lower(column: AnyPgColumn): SQL {
	return sql`lower(${column})`;
}

type ColumnDefinitions = Record<string, PgColumnBuilderBase>;

/**
 * Standard fields for all tables: id, createdAt, updatedAt
 */
export const createBaseFields = <TableName extends string>(tableName: TableName) => ({
	id: pk<TableName>(() => tableName),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

/**
 * Names of standard fields for easy reference
 */
export const BASE_FIELD_NAMES = {
	id: true,
	createdAt: true,
	updatedAt: true,
} as const satisfies Record<string, boolean>;

type BaseFields<TableName extends string> = ReturnType<
	typeof createBaseFields<TableName>
>;

type HasCustomId<T> = T extends { id: PgColumnBuilderBase } ? true : false;

type MergeWithBaseFields<
	CustomColumns extends ColumnDefinitions,
	TableName extends string
> = HasCustomId<CustomColumns> extends true
	? CustomColumns & Omit<BaseFields<TableName>, "id">
	: CustomColumns & BaseFields<TableName>;

type TableResult<
	TableName extends string,
	CustomColumns extends ColumnDefinitions,
> = PgTableWithColumns<{
	name: TableName;
	schema: undefined;
	columns: BuildColumns<
		TableName,
		MergeWithBaseFields<CustomColumns, TableName>,
		"pg"
	>;
	dialect: "pg";
}>;

/**
 * Creates a table with standardized ID and timestamp fields automatically added
 */
export function createTable<
	TableName extends string,
	CustomColumns extends ColumnDefinitions,
>(
	tableName: TableName,
	columns: CustomColumns,
	extraConfig?: (
		tableColumns: BuildExtraConfigColumns<
			TableName,
			MergeWithBaseFields<CustomColumns, TableName>,
			"pg"
		>
	) => PgTableExtraConfigValue[],
): TableResult<TableName, CustomColumns> {
	const baseFields = createBaseFields<TableName>(tableName);
	const hasCustomId = "id" in columns;

	const allColumns = {
		...(hasCustomId
			? { createdAt: baseFields.createdAt, updatedAt: baseFields.updatedAt }
			: baseFields),
		...columns,
	} as MergeWithBaseFields<CustomColumns, TableName>;

	return pgTable(tableName, allColumns, extraConfig);
}