package model

type Alias struct {
	Name           string `json:"name"`
	CollectionName string `json:"collection_name"`
}

type UpsertAliasRequest struct {
	CollectionName string `json:"collection_name"`
}
