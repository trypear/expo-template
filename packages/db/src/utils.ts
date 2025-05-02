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
 * Extracts the UUID portion after the last underscore
 * If no underscore exists, returns the original string
 */
function extractUuid(prefixedId: string): string {
	const lastUnderscoreIndex = prefixedId.lastIndexOf('_');
	return lastUnderscoreIndex !== -1 ? prefixedId.substring(lastUnderscoreIndex + 1) : prefixedId;
}

/**
 * Type for prefixed identifiers with table name
 */
type PrefixedId<TableName extends string> = `${TableName}_${string}`;

/**
 * Creates a custom type that automatically prefixes UUIDs with the table name
 */
export function createPrefixedUuid<TIdName extends string>(nameFn: () => TIdName) {
	return customType<{
		data: string;
		driverData: PrefixedId<TIdName>;
	}>({
		dataType: () => 'uuid',
		fromDriver: (val): PrefixedId<TIdName> => {
			return `${nameFn()}_${val}` as PrefixedId<TIdName>;
		},
		toDriver: (val) => {
			return extractUuid(val) as PrefixedId<TIdName>;
		},
	});
}

/**
 * Creates a primary key column with auto-generated UUID and table name prefix
 */
export function pk<TableName extends string>(tableNameFn: () => TableName) {
	type IdName = `${TableName}_id`;
	// Setting the prefix to be the table name Id
	return createPrefixedUuid<IdName>(() => `${tableNameFn()}_id`)()
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
 * Uses the column name as the ID type 
 */
export function fk<
	T extends { id: AnyPgColumn; _: { name: string } } & AnyPgTable
>(
	columnName: string,
	referencedTableFn: () => T,
	options?: {
		onDelete?: UpdateDeleteAction,
		onUpdate?: UpdateDeleteAction,
		column?: () => AnyPgColumn
	}
) {

	type TIdName = `${ExtractTableName<T>}_id`
	// Simple function that prefixes the column name (avoids circiular references with the table)
	const getColumnName = () => columnName as TIdName;

	return createPrefixedUuid<TIdName>(getColumnName)(columnName)
		.notNull()
		.references(() => (options?.column ? options.column() : referencedTableFn().id), {
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
 * WARNING: IDs are PREFIXED so if you use RAW SQL, you will need to do table.id.fromDriver(x) to strip the prefix
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