// @flow

import {create} from "../../common/utils/EntityUtils"
import {TypeRef} from "../../common/utils/TypeRef"

import type {ArchiveRef} from "./ArchiveRef"

export const ArchiveTypeTypeRef: TypeRef<ArchiveType> = new TypeRef("sys", "ArchiveType")
export const _TypeModel: TypeModel = {
	"name": "ArchiveType",
	"since": 69,
	"type": "AGGREGATED_TYPE",
	"id": 1872,
	"rootId": "A3N5cwAHUA",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_id": {
			"id": 1873,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"application": {
			"id": 1874,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"typeId": {
			"id": 1875,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {
		"active": {
			"id": 1876,
			"type": "AGGREGATION",
			"cardinality": "One",
			"final": false,
			"refType": "ArchiveRef",
			"dependency": null
		},
		"inactive": {
			"id": 1877,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "ArchiveRef",
			"dependency": null
		}
	},
	"app": "sys",
	"version": "69"
}

export function createArchiveType(values?: $Shape<$Exact<ArchiveType>>): ArchiveType {
	return Object.assign(create(_TypeModel, ArchiveTypeTypeRef), values)
}

export type ArchiveType = {
	_type: TypeRef<ArchiveType>;

	_id: Id;
	application: string;
	typeId: NumberString;

	active: ArchiveRef;
	inactive: ArchiveRef[];
}