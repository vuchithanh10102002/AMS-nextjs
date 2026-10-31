import type { Admin } from "@/lib/session";
import type { Row } from "@/lib/db";

export type Option = { value: string; label: string };

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "money"
  | "select"
  | "multiselect"
  | "categories"
  | "switch"
  | "image"
  | "gallery"
  | "file"
  | "editor"
  | "date"
  | "datetime"
  | "color"
  | "slug"
  | "password"
  | "readonly"
  | "custom";

export type Target = "node" | "main";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  target?: Target;
  required?: boolean;
  options?: Option[];
  optionsKey?: string;
  ctype?: string | string[];
  storage?: "csv" | "wrap" | "json" | "unix" | "date";
  default?: string | number;
  tab?: string;
  help?: string;
  placeholder?: string;
  only?: "add" | "edit";
  half?: boolean;
  rows?: number;
  maxLength?: number;
  height?: number;
  component?: string;
  props?: Record<string, unknown>;
};

export type ColumnKind =
  | "text"
  | "image"
  | "toggle"
  | "money"
  | "number"
  | "date"
  | "datetime"
  | "unix"
  | "badge"
  | "categories"
  | "pos"
  | "html";

export type Column = {
  name: string;
  label: string;
  kind?: ColumnKind;
  options?: Option[];
  width?: number;
  link?: boolean;
};

export type FilterDef =
  | { kind: "search"; name: string; label: string; columns: string[] }
  | {
      kind: "select";
      name: string;
      label: string;
      column: string;
      options?: Option[];
      optionsKey?: string;
    }
  | { kind: "category"; name: string; label: string; ctype?: string | string[] }
  | { kind: "daterange"; name: string; label: string; column: string; unix?: boolean };

export type Ctx = {
  admin: Admin;
  id: number | null;
  isNew: boolean;
  form: FormData;
  before: Row | null;
};

export type ModuleDef = {
  key: string;
  title: string;
  table: string;
  node?: string;
  perm?: string;
  icon?: string;
  adds?: boolean;
  edits?: boolean;
  deletes?: boolean;
  copies?: boolean;
  positions?: boolean;
  statusToggle?: boolean;
  previewLink?: boolean;
  list: {
    columns: Column[];
    filters?: FilterDef[];
    order?: Row[];
    pageSize?: number;
    where?: Row;
    toggles?: string[];
  };
  form?: { tabs?: string[]; fields: Field[] };
  options?: Record<string, () => Promise<Option[]>>;
  scope?: (admin: Admin) => Row | null;
  hooks?: {
    load?: (row: Row) => Promise<Row> | Row;
    beforeSave?: (data: { node: Row; main: Row }, ctx: Ctx) => Promise<void> | void;
    afterSave?: (id: number, data: { node: Row; main: Row }, ctx: Ctx) => Promise<void> | void;
    afterDelete?: (ids: number[], rows: Row[]) => Promise<void> | void;
    afterCopy?: (newId: number, srcId: number) => Promise<void> | void;
    decorate?: (rows: Row[]) => Promise<void> | void;
  };
};

export type ClientField = Omit<Field, "optionsKey"> & { options?: Option[] };

export type ClientModule = {
  key: string;
  title: string;
  node: boolean;
  adds: boolean;
  edits: boolean;
  deletes: boolean;
  copies: boolean;
  positions: boolean;
  statusToggle: boolean;
  previewLink: boolean;
  columns: Column[];
  filters: (FilterDef & { options?: Option[] })[];
  toggles: string[];
  tabs: string[];
  fields: ClientField[];
  can: { add: boolean; edit: boolean; delete: boolean };
};
