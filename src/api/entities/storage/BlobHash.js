// @flow

import {create} from "../../common/utils/EntityUtils"
import {TypeRef} from "../../common/utils/TypeRef"


export const BlobHashTypeRef: TypeRef<BlobHash> = new TypeRef("storage", "BlobHash")
export const _TypeModel: TypeModel = {
	"name": "BlobHash",
	"since": 1,
	"type": "AGGREGATED_TYPE",
	"id": 41,
	"rootId": "B3N0b3JhZ2UAKQ",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_id": {
			"id": 42,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"hash": {
			"id": 43,
			"type": "Bytes",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {},
	"app": "storage",
	"version": "1"
}

export function createBlobHash(values?: $Shape<$Exact<BlobHash>>): BlobHash {
	return Object.assign(create(_TypeModel, BlobHashTypeRef), values)
}

export type BlobHash = {
	_type: TypeRef<BlobHash>;

	_id: Id;
	hash: Uint8Array;
}