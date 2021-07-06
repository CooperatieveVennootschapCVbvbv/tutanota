// @flow

import {create} from "../../common/utils/EntityUtils"
import {TypeRef} from "../../common/utils/TypeRef"

import type {BlobHash} from "./BlobHash"

export const BlobServiceGetDataTypeRef: TypeRef<BlobServiceGetData> = new TypeRef("storage", "BlobServiceGetData")
export const _TypeModel: TypeModel = {
	"name": "BlobServiceGetData",
	"since": 1,
	"type": "DATA_TRANSFER_TYPE",
	"id": 44,
	"rootId": "B3N0b3JhZ2UALA",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 45,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"archiveId": {
			"id": 46,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {
		"blobs": {
			"id": 47,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "BlobHash"
		}
	},
	"app": "storage",
	"version": "1"
}

export function createBlobServiceGetData(values?: $Shape<$Exact<BlobServiceGetData>>): BlobServiceGetData {
	return Object.assign(create(_TypeModel, BlobServiceGetDataTypeRef), values)
}

export type BlobServiceGetData = {
	_type: TypeRef<BlobServiceGetData>;

	_format: NumberString;
	archiveId: Id;

	blobs: BlobHash[];
}