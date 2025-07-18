import { GraphQLClient, RequestOptions } from 'graphql-request'
import gql from 'graphql-tag'

export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never
}
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders']
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
}

export type AffectedRowsOutput = {
  __typename?: 'AffectedRowsOutput'
  count: Scalars['Int']['output']
}

export type AggregateAttestation = {
  __typename?: 'AggregateAttestation'
  _avg?: Maybe<AttestationAvgAggregate>
  _count?: Maybe<AttestationCountAggregate>
  _max?: Maybe<AttestationMaxAggregate>
  _min?: Maybe<AttestationMinAggregate>
  _sum?: Maybe<AttestationSumAggregate>
}

export type AggregateEnsName = {
  __typename?: 'AggregateEnsName'
  _avg?: Maybe<EnsNameAvgAggregate>
  _count?: Maybe<EnsNameCountAggregate>
  _max?: Maybe<EnsNameMaxAggregate>
  _min?: Maybe<EnsNameMinAggregate>
  _sum?: Maybe<EnsNameSumAggregate>
}

export type AggregateOffchainRevocation = {
  __typename?: 'AggregateOffchainRevocation'
  _avg?: Maybe<OffchainRevocationAvgAggregate>
  _count?: Maybe<OffchainRevocationCountAggregate>
  _max?: Maybe<OffchainRevocationMaxAggregate>
  _min?: Maybe<OffchainRevocationMinAggregate>
  _sum?: Maybe<OffchainRevocationSumAggregate>
}

export type AggregateSchema = {
  __typename?: 'AggregateSchema'
  _avg?: Maybe<SchemaAvgAggregate>
  _count?: Maybe<SchemaCountAggregate>
  _max?: Maybe<SchemaMaxAggregate>
  _min?: Maybe<SchemaMinAggregate>
  _sum?: Maybe<SchemaSumAggregate>
}

export type AggregateSchemaName = {
  __typename?: 'AggregateSchemaName'
  _avg?: Maybe<SchemaNameAvgAggregate>
  _count?: Maybe<SchemaNameCountAggregate>
  _max?: Maybe<SchemaNameMaxAggregate>
  _min?: Maybe<SchemaNameMinAggregate>
  _sum?: Maybe<SchemaNameSumAggregate>
}

export type AggregateServiceStat = {
  __typename?: 'AggregateServiceStat'
  _count?: Maybe<ServiceStatCountAggregate>
  _max?: Maybe<ServiceStatMaxAggregate>
  _min?: Maybe<ServiceStatMinAggregate>
}

export type AggregateTimestamp = {
  __typename?: 'AggregateTimestamp'
  _avg?: Maybe<TimestampAvgAggregate>
  _count?: Maybe<TimestampCountAggregate>
  _max?: Maybe<TimestampMaxAggregate>
  _min?: Maybe<TimestampMinAggregate>
  _sum?: Maybe<TimestampSumAggregate>
}

export type Attestation = {
  __typename?: 'Attestation'
  attester: Scalars['String']['output']
  data: Scalars['String']['output']
  decodedDataJson: Scalars['String']['output']
  expirationTime: Scalars['Int']['output']
  id: Scalars['String']['output']
  ipfsHash: Scalars['String']['output']
  isOffchain: Scalars['Boolean']['output']
  recipient: Scalars['String']['output']
  refUID: Scalars['String']['output']
  revocable: Scalars['Boolean']['output']
  revocationTime: Scalars['Int']['output']
  revoked: Scalars['Boolean']['output']
  schema: Schema
  schemaId: Scalars['String']['output']
  time: Scalars['Int']['output']
  timeCreated: Scalars['Int']['output']
  txid: Scalars['String']['output']
}

export type AttestationAvgAggregate = {
  __typename?: 'AttestationAvgAggregate'
  expirationTime?: Maybe<Scalars['Float']['output']>
  revocationTime?: Maybe<Scalars['Float']['output']>
  time?: Maybe<Scalars['Float']['output']>
  timeCreated?: Maybe<Scalars['Float']['output']>
}

export type AttestationAvgOrderByAggregateInput = {
  expirationTime?: InputMaybe<SortOrder>
  revocationTime?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  timeCreated?: InputMaybe<SortOrder>
}

export type AttestationCountAggregate = {
  __typename?: 'AttestationCountAggregate'
  _all: Scalars['Int']['output']
  attester: Scalars['Int']['output']
  data: Scalars['Int']['output']
  decodedDataJson: Scalars['Int']['output']
  expirationTime: Scalars['Int']['output']
  id: Scalars['Int']['output']
  ipfsHash: Scalars['Int']['output']
  isOffchain: Scalars['Int']['output']
  recipient: Scalars['Int']['output']
  refUID: Scalars['Int']['output']
  revocable: Scalars['Int']['output']
  revocationTime: Scalars['Int']['output']
  revoked: Scalars['Int']['output']
  schemaId: Scalars['Int']['output']
  time: Scalars['Int']['output']
  timeCreated: Scalars['Int']['output']
  txid: Scalars['Int']['output']
}

export type AttestationCountOrderByAggregateInput = {
  attester?: InputMaybe<SortOrder>
  data?: InputMaybe<SortOrder>
  decodedDataJson?: InputMaybe<SortOrder>
  expirationTime?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  ipfsHash?: InputMaybe<SortOrder>
  isOffchain?: InputMaybe<SortOrder>
  recipient?: InputMaybe<SortOrder>
  refUID?: InputMaybe<SortOrder>
  revocable?: InputMaybe<SortOrder>
  revocationTime?: InputMaybe<SortOrder>
  revoked?: InputMaybe<SortOrder>
  schemaId?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  timeCreated?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type AttestationCreateInput = {
  attester: Scalars['String']['input']
  data: Scalars['String']['input']
  decodedDataJson?: InputMaybe<Scalars['String']['input']>
  expirationTime: Scalars['Int']['input']
  id: Scalars['String']['input']
  ipfsHash: Scalars['String']['input']
  isOffchain: Scalars['Boolean']['input']
  recipient: Scalars['String']['input']
  refUID: Scalars['String']['input']
  revocable: Scalars['Boolean']['input']
  revocationTime: Scalars['Int']['input']
  revoked: Scalars['Boolean']['input']
  schema: SchemaCreateNestedOneWithoutAttestationsInput
  time: Scalars['Int']['input']
  timeCreated: Scalars['Int']['input']
  txid: Scalars['String']['input']
}

export type AttestationCreateManyInput = {
  attester: Scalars['String']['input']
  data: Scalars['String']['input']
  decodedDataJson?: InputMaybe<Scalars['String']['input']>
  expirationTime: Scalars['Int']['input']
  id: Scalars['String']['input']
  ipfsHash: Scalars['String']['input']
  isOffchain: Scalars['Boolean']['input']
  recipient: Scalars['String']['input']
  refUID: Scalars['String']['input']
  revocable: Scalars['Boolean']['input']
  revocationTime: Scalars['Int']['input']
  revoked: Scalars['Boolean']['input']
  schemaId: Scalars['String']['input']
  time: Scalars['Int']['input']
  timeCreated: Scalars['Int']['input']
  txid: Scalars['String']['input']
}

export type AttestationCreateManySchemaInput = {
  attester: Scalars['String']['input']
  data: Scalars['String']['input']
  decodedDataJson?: InputMaybe<Scalars['String']['input']>
  expirationTime: Scalars['Int']['input']
  id: Scalars['String']['input']
  ipfsHash: Scalars['String']['input']
  isOffchain: Scalars['Boolean']['input']
  recipient: Scalars['String']['input']
  refUID: Scalars['String']['input']
  revocable: Scalars['Boolean']['input']
  revocationTime: Scalars['Int']['input']
  revoked: Scalars['Boolean']['input']
  time: Scalars['Int']['input']
  timeCreated: Scalars['Int']['input']
  txid: Scalars['String']['input']
}

export type AttestationCreateManySchemaInputEnvelope = {
  data: Array<AttestationCreateManySchemaInput>
  skipDuplicates?: InputMaybe<Scalars['Boolean']['input']>
}

export type AttestationCreateNestedManyWithoutSchemaInput = {
  connect?: InputMaybe<Array<AttestationWhereUniqueInput>>
  connectOrCreate?: InputMaybe<Array<AttestationCreateOrConnectWithoutSchemaInput>>
  create?: InputMaybe<Array<AttestationCreateWithoutSchemaInput>>
  createMany?: InputMaybe<AttestationCreateManySchemaInputEnvelope>
}

export type AttestationCreateOrConnectWithoutSchemaInput = {
  create: AttestationCreateWithoutSchemaInput
  where: AttestationWhereUniqueInput
}

export type AttestationCreateWithoutSchemaInput = {
  attester: Scalars['String']['input']
  data: Scalars['String']['input']
  decodedDataJson?: InputMaybe<Scalars['String']['input']>
  expirationTime: Scalars['Int']['input']
  id: Scalars['String']['input']
  ipfsHash: Scalars['String']['input']
  isOffchain: Scalars['Boolean']['input']
  recipient: Scalars['String']['input']
  refUID: Scalars['String']['input']
  revocable: Scalars['Boolean']['input']
  revocationTime: Scalars['Int']['input']
  revoked: Scalars['Boolean']['input']
  time: Scalars['Int']['input']
  timeCreated: Scalars['Int']['input']
  txid: Scalars['String']['input']
}

export type AttestationGroupBy = {
  __typename?: 'AttestationGroupBy'
  _avg?: Maybe<AttestationAvgAggregate>
  _count?: Maybe<AttestationCountAggregate>
  _max?: Maybe<AttestationMaxAggregate>
  _min?: Maybe<AttestationMinAggregate>
  _sum?: Maybe<AttestationSumAggregate>
  attester: Scalars['String']['output']
  data: Scalars['String']['output']
  decodedDataJson: Scalars['String']['output']
  expirationTime: Scalars['Int']['output']
  id: Scalars['String']['output']
  ipfsHash: Scalars['String']['output']
  isOffchain: Scalars['Boolean']['output']
  recipient: Scalars['String']['output']
  refUID: Scalars['String']['output']
  revocable: Scalars['Boolean']['output']
  revocationTime: Scalars['Int']['output']
  revoked: Scalars['Boolean']['output']
  schemaId: Scalars['String']['output']
  time: Scalars['Int']['output']
  timeCreated: Scalars['Int']['output']
  txid: Scalars['String']['output']
}

export type AttestationListRelationFilter = {
  every?: InputMaybe<AttestationWhereInput>
  none?: InputMaybe<AttestationWhereInput>
  some?: InputMaybe<AttestationWhereInput>
}

export type AttestationMaxAggregate = {
  __typename?: 'AttestationMaxAggregate'
  attester?: Maybe<Scalars['String']['output']>
  data?: Maybe<Scalars['String']['output']>
  decodedDataJson?: Maybe<Scalars['String']['output']>
  expirationTime?: Maybe<Scalars['Int']['output']>
  id?: Maybe<Scalars['String']['output']>
  ipfsHash?: Maybe<Scalars['String']['output']>
  isOffchain?: Maybe<Scalars['Boolean']['output']>
  recipient?: Maybe<Scalars['String']['output']>
  refUID?: Maybe<Scalars['String']['output']>
  revocable?: Maybe<Scalars['Boolean']['output']>
  revocationTime?: Maybe<Scalars['Int']['output']>
  revoked?: Maybe<Scalars['Boolean']['output']>
  schemaId?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['Int']['output']>
  timeCreated?: Maybe<Scalars['Int']['output']>
  txid?: Maybe<Scalars['String']['output']>
}

export type AttestationMaxOrderByAggregateInput = {
  attester?: InputMaybe<SortOrder>
  data?: InputMaybe<SortOrder>
  decodedDataJson?: InputMaybe<SortOrder>
  expirationTime?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  ipfsHash?: InputMaybe<SortOrder>
  isOffchain?: InputMaybe<SortOrder>
  recipient?: InputMaybe<SortOrder>
  refUID?: InputMaybe<SortOrder>
  revocable?: InputMaybe<SortOrder>
  revocationTime?: InputMaybe<SortOrder>
  revoked?: InputMaybe<SortOrder>
  schemaId?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  timeCreated?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type AttestationMinAggregate = {
  __typename?: 'AttestationMinAggregate'
  attester?: Maybe<Scalars['String']['output']>
  data?: Maybe<Scalars['String']['output']>
  decodedDataJson?: Maybe<Scalars['String']['output']>
  expirationTime?: Maybe<Scalars['Int']['output']>
  id?: Maybe<Scalars['String']['output']>
  ipfsHash?: Maybe<Scalars['String']['output']>
  isOffchain?: Maybe<Scalars['Boolean']['output']>
  recipient?: Maybe<Scalars['String']['output']>
  refUID?: Maybe<Scalars['String']['output']>
  revocable?: Maybe<Scalars['Boolean']['output']>
  revocationTime?: Maybe<Scalars['Int']['output']>
  revoked?: Maybe<Scalars['Boolean']['output']>
  schemaId?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['Int']['output']>
  timeCreated?: Maybe<Scalars['Int']['output']>
  txid?: Maybe<Scalars['String']['output']>
}

export type AttestationMinOrderByAggregateInput = {
  attester?: InputMaybe<SortOrder>
  data?: InputMaybe<SortOrder>
  decodedDataJson?: InputMaybe<SortOrder>
  expirationTime?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  ipfsHash?: InputMaybe<SortOrder>
  isOffchain?: InputMaybe<SortOrder>
  recipient?: InputMaybe<SortOrder>
  refUID?: InputMaybe<SortOrder>
  revocable?: InputMaybe<SortOrder>
  revocationTime?: InputMaybe<SortOrder>
  revoked?: InputMaybe<SortOrder>
  schemaId?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  timeCreated?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type AttestationOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>
}

export type AttestationOrderByWithAggregationInput = {
  _avg?: InputMaybe<AttestationAvgOrderByAggregateInput>
  _count?: InputMaybe<AttestationCountOrderByAggregateInput>
  _max?: InputMaybe<AttestationMaxOrderByAggregateInput>
  _min?: InputMaybe<AttestationMinOrderByAggregateInput>
  _sum?: InputMaybe<AttestationSumOrderByAggregateInput>
  attester?: InputMaybe<SortOrder>
  data?: InputMaybe<SortOrder>
  decodedDataJson?: InputMaybe<SortOrder>
  expirationTime?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  ipfsHash?: InputMaybe<SortOrder>
  isOffchain?: InputMaybe<SortOrder>
  recipient?: InputMaybe<SortOrder>
  refUID?: InputMaybe<SortOrder>
  revocable?: InputMaybe<SortOrder>
  revocationTime?: InputMaybe<SortOrder>
  revoked?: InputMaybe<SortOrder>
  schemaId?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  timeCreated?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type AttestationOrderByWithRelationInput = {
  attester?: InputMaybe<SortOrder>
  data?: InputMaybe<SortOrder>
  decodedDataJson?: InputMaybe<SortOrder>
  expirationTime?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  ipfsHash?: InputMaybe<SortOrder>
  isOffchain?: InputMaybe<SortOrder>
  recipient?: InputMaybe<SortOrder>
  refUID?: InputMaybe<SortOrder>
  revocable?: InputMaybe<SortOrder>
  revocationTime?: InputMaybe<SortOrder>
  revoked?: InputMaybe<SortOrder>
  schema?: InputMaybe<SchemaOrderByWithRelationInput>
  schemaId?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  timeCreated?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export enum AttestationScalarFieldEnum {
  Attester = 'attester',
  Data = 'data',
  DecodedDataJson = 'decodedDataJson',
  ExpirationTime = 'expirationTime',
  Id = 'id',
  IpfsHash = 'ipfsHash',
  IsOffchain = 'isOffchain',
  Recipient = 'recipient',
  RefUid = 'refUID',
  Revocable = 'revocable',
  RevocationTime = 'revocationTime',
  Revoked = 'revoked',
  SchemaId = 'schemaId',
  Time = 'time',
  TimeCreated = 'timeCreated',
  Txid = 'txid',
}

export type AttestationScalarWhereInput = {
  AND?: InputMaybe<Array<AttestationScalarWhereInput>>
  NOT?: InputMaybe<Array<AttestationScalarWhereInput>>
  OR?: InputMaybe<Array<AttestationScalarWhereInput>>
  attester?: InputMaybe<StringFilter>
  data?: InputMaybe<StringFilter>
  decodedDataJson?: InputMaybe<StringFilter>
  expirationTime?: InputMaybe<IntFilter>
  id?: InputMaybe<StringFilter>
  ipfsHash?: InputMaybe<StringFilter>
  isOffchain?: InputMaybe<BoolFilter>
  recipient?: InputMaybe<StringFilter>
  refUID?: InputMaybe<StringFilter>
  revocable?: InputMaybe<BoolFilter>
  revocationTime?: InputMaybe<IntFilter>
  revoked?: InputMaybe<BoolFilter>
  schemaId?: InputMaybe<StringFilter>
  time?: InputMaybe<IntFilter>
  timeCreated?: InputMaybe<IntFilter>
  txid?: InputMaybe<StringFilter>
}

export type AttestationScalarWhereWithAggregatesInput = {
  AND?: InputMaybe<Array<AttestationScalarWhereWithAggregatesInput>>
  NOT?: InputMaybe<Array<AttestationScalarWhereWithAggregatesInput>>
  OR?: InputMaybe<Array<AttestationScalarWhereWithAggregatesInput>>
  attester?: InputMaybe<StringWithAggregatesFilter>
  data?: InputMaybe<StringWithAggregatesFilter>
  decodedDataJson?: InputMaybe<StringWithAggregatesFilter>
  expirationTime?: InputMaybe<IntWithAggregatesFilter>
  id?: InputMaybe<StringWithAggregatesFilter>
  ipfsHash?: InputMaybe<StringWithAggregatesFilter>
  isOffchain?: InputMaybe<BoolWithAggregatesFilter>
  recipient?: InputMaybe<StringWithAggregatesFilter>
  refUID?: InputMaybe<StringWithAggregatesFilter>
  revocable?: InputMaybe<BoolWithAggregatesFilter>
  revocationTime?: InputMaybe<IntWithAggregatesFilter>
  revoked?: InputMaybe<BoolWithAggregatesFilter>
  schemaId?: InputMaybe<StringWithAggregatesFilter>
  time?: InputMaybe<IntWithAggregatesFilter>
  timeCreated?: InputMaybe<IntWithAggregatesFilter>
  txid?: InputMaybe<StringWithAggregatesFilter>
}

export type AttestationSumAggregate = {
  __typename?: 'AttestationSumAggregate'
  expirationTime?: Maybe<Scalars['Int']['output']>
  revocationTime?: Maybe<Scalars['Int']['output']>
  time?: Maybe<Scalars['Int']['output']>
  timeCreated?: Maybe<Scalars['Int']['output']>
}

export type AttestationSumOrderByAggregateInput = {
  expirationTime?: InputMaybe<SortOrder>
  revocationTime?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  timeCreated?: InputMaybe<SortOrder>
}

export type AttestationUpdateInput = {
  attester?: InputMaybe<StringFieldUpdateOperationsInput>
  data?: InputMaybe<StringFieldUpdateOperationsInput>
  decodedDataJson?: InputMaybe<StringFieldUpdateOperationsInput>
  expirationTime?: InputMaybe<IntFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  ipfsHash?: InputMaybe<StringFieldUpdateOperationsInput>
  isOffchain?: InputMaybe<BoolFieldUpdateOperationsInput>
  recipient?: InputMaybe<StringFieldUpdateOperationsInput>
  refUID?: InputMaybe<StringFieldUpdateOperationsInput>
  revocable?: InputMaybe<BoolFieldUpdateOperationsInput>
  revocationTime?: InputMaybe<IntFieldUpdateOperationsInput>
  revoked?: InputMaybe<BoolFieldUpdateOperationsInput>
  schema?: InputMaybe<SchemaUpdateOneRequiredWithoutAttestationsNestedInput>
  time?: InputMaybe<IntFieldUpdateOperationsInput>
  timeCreated?: InputMaybe<IntFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type AttestationUpdateManyMutationInput = {
  attester?: InputMaybe<StringFieldUpdateOperationsInput>
  data?: InputMaybe<StringFieldUpdateOperationsInput>
  decodedDataJson?: InputMaybe<StringFieldUpdateOperationsInput>
  expirationTime?: InputMaybe<IntFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  ipfsHash?: InputMaybe<StringFieldUpdateOperationsInput>
  isOffchain?: InputMaybe<BoolFieldUpdateOperationsInput>
  recipient?: InputMaybe<StringFieldUpdateOperationsInput>
  refUID?: InputMaybe<StringFieldUpdateOperationsInput>
  revocable?: InputMaybe<BoolFieldUpdateOperationsInput>
  revocationTime?: InputMaybe<IntFieldUpdateOperationsInput>
  revoked?: InputMaybe<BoolFieldUpdateOperationsInput>
  time?: InputMaybe<IntFieldUpdateOperationsInput>
  timeCreated?: InputMaybe<IntFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type AttestationUpdateManyWithWhereWithoutSchemaInput = {
  data: AttestationUpdateManyMutationInput
  where: AttestationScalarWhereInput
}

export type AttestationUpdateManyWithoutSchemaNestedInput = {
  connect?: InputMaybe<Array<AttestationWhereUniqueInput>>
  connectOrCreate?: InputMaybe<Array<AttestationCreateOrConnectWithoutSchemaInput>>
  create?: InputMaybe<Array<AttestationCreateWithoutSchemaInput>>
  createMany?: InputMaybe<AttestationCreateManySchemaInputEnvelope>
  delete?: InputMaybe<Array<AttestationWhereUniqueInput>>
  deleteMany?: InputMaybe<Array<AttestationScalarWhereInput>>
  disconnect?: InputMaybe<Array<AttestationWhereUniqueInput>>
  set?: InputMaybe<Array<AttestationWhereUniqueInput>>
  update?: InputMaybe<Array<AttestationUpdateWithWhereUniqueWithoutSchemaInput>>
  updateMany?: InputMaybe<Array<AttestationUpdateManyWithWhereWithoutSchemaInput>>
  upsert?: InputMaybe<Array<AttestationUpsertWithWhereUniqueWithoutSchemaInput>>
}

export type AttestationUpdateWithWhereUniqueWithoutSchemaInput = {
  data: AttestationUpdateWithoutSchemaInput
  where: AttestationWhereUniqueInput
}

export type AttestationUpdateWithoutSchemaInput = {
  attester?: InputMaybe<StringFieldUpdateOperationsInput>
  data?: InputMaybe<StringFieldUpdateOperationsInput>
  decodedDataJson?: InputMaybe<StringFieldUpdateOperationsInput>
  expirationTime?: InputMaybe<IntFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  ipfsHash?: InputMaybe<StringFieldUpdateOperationsInput>
  isOffchain?: InputMaybe<BoolFieldUpdateOperationsInput>
  recipient?: InputMaybe<StringFieldUpdateOperationsInput>
  refUID?: InputMaybe<StringFieldUpdateOperationsInput>
  revocable?: InputMaybe<BoolFieldUpdateOperationsInput>
  revocationTime?: InputMaybe<IntFieldUpdateOperationsInput>
  revoked?: InputMaybe<BoolFieldUpdateOperationsInput>
  time?: InputMaybe<IntFieldUpdateOperationsInput>
  timeCreated?: InputMaybe<IntFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type AttestationUpsertWithWhereUniqueWithoutSchemaInput = {
  create: AttestationCreateWithoutSchemaInput
  update: AttestationUpdateWithoutSchemaInput
  where: AttestationWhereUniqueInput
}

export type AttestationWhereInput = {
  AND?: InputMaybe<Array<AttestationWhereInput>>
  NOT?: InputMaybe<Array<AttestationWhereInput>>
  OR?: InputMaybe<Array<AttestationWhereInput>>
  attester?: InputMaybe<StringFilter>
  data?: InputMaybe<StringFilter>
  decodedDataJson?: InputMaybe<StringFilter>
  expirationTime?: InputMaybe<IntFilter>
  id?: InputMaybe<StringFilter>
  ipfsHash?: InputMaybe<StringFilter>
  isOffchain?: InputMaybe<BoolFilter>
  recipient?: InputMaybe<StringFilter>
  refUID?: InputMaybe<StringFilter>
  revocable?: InputMaybe<BoolFilter>
  revocationTime?: InputMaybe<IntFilter>
  revoked?: InputMaybe<BoolFilter>
  schema?: InputMaybe<SchemaRelationFilter>
  schemaId?: InputMaybe<StringFilter>
  time?: InputMaybe<IntFilter>
  timeCreated?: InputMaybe<IntFilter>
  txid?: InputMaybe<StringFilter>
}

export type AttestationWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']['input']>
}

export type BoolFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['Boolean']['input']>
}

export type BoolFilter = {
  equals?: InputMaybe<Scalars['Boolean']['input']>
  not?: InputMaybe<NestedBoolFilter>
}

export type BoolWithAggregatesFilter = {
  _count?: InputMaybe<NestedIntFilter>
  _max?: InputMaybe<NestedBoolFilter>
  _min?: InputMaybe<NestedBoolFilter>
  equals?: InputMaybe<Scalars['Boolean']['input']>
  not?: InputMaybe<NestedBoolWithAggregatesFilter>
}

export type EnsName = {
  __typename?: 'EnsName'
  id: Scalars['String']['output']
  name: Scalars['String']['output']
  timestamp: Scalars['Int']['output']
}

export type EnsNameAvgAggregate = {
  __typename?: 'EnsNameAvgAggregate'
  timestamp?: Maybe<Scalars['Float']['output']>
}

export type EnsNameAvgOrderByAggregateInput = {
  timestamp?: InputMaybe<SortOrder>
}

export type EnsNameCountAggregate = {
  __typename?: 'EnsNameCountAggregate'
  _all: Scalars['Int']['output']
  id: Scalars['Int']['output']
  name: Scalars['Int']['output']
  timestamp: Scalars['Int']['output']
}

export type EnsNameCountOrderByAggregateInput = {
  id?: InputMaybe<SortOrder>
  name?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
}

export type EnsNameCreateInput = {
  id: Scalars['String']['input']
  name: Scalars['String']['input']
  timestamp: Scalars['Int']['input']
}

export type EnsNameCreateManyInput = {
  id: Scalars['String']['input']
  name: Scalars['String']['input']
  timestamp: Scalars['Int']['input']
}

export type EnsNameGroupBy = {
  __typename?: 'EnsNameGroupBy'
  _avg?: Maybe<EnsNameAvgAggregate>
  _count?: Maybe<EnsNameCountAggregate>
  _max?: Maybe<EnsNameMaxAggregate>
  _min?: Maybe<EnsNameMinAggregate>
  _sum?: Maybe<EnsNameSumAggregate>
  id: Scalars['String']['output']
  name: Scalars['String']['output']
  timestamp: Scalars['Int']['output']
}

export type EnsNameMaxAggregate = {
  __typename?: 'EnsNameMaxAggregate'
  id?: Maybe<Scalars['String']['output']>
  name?: Maybe<Scalars['String']['output']>
  timestamp?: Maybe<Scalars['Int']['output']>
}

export type EnsNameMaxOrderByAggregateInput = {
  id?: InputMaybe<SortOrder>
  name?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
}

export type EnsNameMinAggregate = {
  __typename?: 'EnsNameMinAggregate'
  id?: Maybe<Scalars['String']['output']>
  name?: Maybe<Scalars['String']['output']>
  timestamp?: Maybe<Scalars['Int']['output']>
}

export type EnsNameMinOrderByAggregateInput = {
  id?: InputMaybe<SortOrder>
  name?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
}

export type EnsNameOrderByWithAggregationInput = {
  _avg?: InputMaybe<EnsNameAvgOrderByAggregateInput>
  _count?: InputMaybe<EnsNameCountOrderByAggregateInput>
  _max?: InputMaybe<EnsNameMaxOrderByAggregateInput>
  _min?: InputMaybe<EnsNameMinOrderByAggregateInput>
  _sum?: InputMaybe<EnsNameSumOrderByAggregateInput>
  id?: InputMaybe<SortOrder>
  name?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
}

export type EnsNameOrderByWithRelationInput = {
  id?: InputMaybe<SortOrder>
  name?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
}

export enum EnsNameScalarFieldEnum {
  Id = 'id',
  Name = 'name',
  Timestamp = 'timestamp',
}

export type EnsNameScalarWhereWithAggregatesInput = {
  AND?: InputMaybe<Array<EnsNameScalarWhereWithAggregatesInput>>
  NOT?: InputMaybe<Array<EnsNameScalarWhereWithAggregatesInput>>
  OR?: InputMaybe<Array<EnsNameScalarWhereWithAggregatesInput>>
  id?: InputMaybe<StringWithAggregatesFilter>
  name?: InputMaybe<StringWithAggregatesFilter>
  timestamp?: InputMaybe<IntWithAggregatesFilter>
}

export type EnsNameSumAggregate = {
  __typename?: 'EnsNameSumAggregate'
  timestamp?: Maybe<Scalars['Int']['output']>
}

export type EnsNameSumOrderByAggregateInput = {
  timestamp?: InputMaybe<SortOrder>
}

export type EnsNameUpdateInput = {
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  name?: InputMaybe<StringFieldUpdateOperationsInput>
  timestamp?: InputMaybe<IntFieldUpdateOperationsInput>
}

export type EnsNameUpdateManyMutationInput = {
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  name?: InputMaybe<StringFieldUpdateOperationsInput>
  timestamp?: InputMaybe<IntFieldUpdateOperationsInput>
}

export type EnsNameWhereInput = {
  AND?: InputMaybe<Array<EnsNameWhereInput>>
  NOT?: InputMaybe<Array<EnsNameWhereInput>>
  OR?: InputMaybe<Array<EnsNameWhereInput>>
  id?: InputMaybe<StringFilter>
  name?: InputMaybe<StringFilter>
  timestamp?: InputMaybe<IntFilter>
}

export type EnsNameWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']['input']>
}

export type IntFieldUpdateOperationsInput = {
  decrement?: InputMaybe<Scalars['Int']['input']>
  divide?: InputMaybe<Scalars['Int']['input']>
  increment?: InputMaybe<Scalars['Int']['input']>
  multiply?: InputMaybe<Scalars['Int']['input']>
  set?: InputMaybe<Scalars['Int']['input']>
}

export type IntFilter = {
  equals?: InputMaybe<Scalars['Int']['input']>
  gt?: InputMaybe<Scalars['Int']['input']>
  gte?: InputMaybe<Scalars['Int']['input']>
  in?: InputMaybe<Array<Scalars['Int']['input']>>
  lt?: InputMaybe<Scalars['Int']['input']>
  lte?: InputMaybe<Scalars['Int']['input']>
  not?: InputMaybe<NestedIntFilter>
  notIn?: InputMaybe<Array<Scalars['Int']['input']>>
}

export type IntWithAggregatesFilter = {
  _avg?: InputMaybe<NestedFloatFilter>
  _count?: InputMaybe<NestedIntFilter>
  _max?: InputMaybe<NestedIntFilter>
  _min?: InputMaybe<NestedIntFilter>
  _sum?: InputMaybe<NestedIntFilter>
  equals?: InputMaybe<Scalars['Int']['input']>
  gt?: InputMaybe<Scalars['Int']['input']>
  gte?: InputMaybe<Scalars['Int']['input']>
  in?: InputMaybe<Array<Scalars['Int']['input']>>
  lt?: InputMaybe<Scalars['Int']['input']>
  lte?: InputMaybe<Scalars['Int']['input']>
  not?: InputMaybe<NestedIntWithAggregatesFilter>
  notIn?: InputMaybe<Array<Scalars['Int']['input']>>
}

export type Mutation = {
  __typename?: 'Mutation'
  createManyAttestation: AffectedRowsOutput
  createManyEnsName: AffectedRowsOutput
  createManyOffchainRevocation: AffectedRowsOutput
  createManySchema: AffectedRowsOutput
  createManySchemaName: AffectedRowsOutput
  createManyServiceStat: AffectedRowsOutput
  createManyTimestamp: AffectedRowsOutput
  createOneAttestation: Attestation
  createOneEnsName: EnsName
  createOneOffchainRevocation: OffchainRevocation
  createOneSchema: Schema
  createOneSchemaName: SchemaName
  createOneServiceStat: ServiceStat
  createOneTimestamp: Timestamp
  deleteManyAttestation: AffectedRowsOutput
  deleteManyEnsName: AffectedRowsOutput
  deleteManyOffchainRevocation: AffectedRowsOutput
  deleteManySchema: AffectedRowsOutput
  deleteManySchemaName: AffectedRowsOutput
  deleteManyServiceStat: AffectedRowsOutput
  deleteManyTimestamp: AffectedRowsOutput
  deleteOneAttestation?: Maybe<Attestation>
  deleteOneEnsName?: Maybe<EnsName>
  deleteOneOffchainRevocation?: Maybe<OffchainRevocation>
  deleteOneSchema?: Maybe<Schema>
  deleteOneSchemaName?: Maybe<SchemaName>
  deleteOneServiceStat?: Maybe<ServiceStat>
  deleteOneTimestamp?: Maybe<Timestamp>
  updateManyAttestation: AffectedRowsOutput
  updateManyEnsName: AffectedRowsOutput
  updateManyOffchainRevocation: AffectedRowsOutput
  updateManySchema: AffectedRowsOutput
  updateManySchemaName: AffectedRowsOutput
  updateManyServiceStat: AffectedRowsOutput
  updateManyTimestamp: AffectedRowsOutput
  updateOneAttestation?: Maybe<Attestation>
  updateOneEnsName?: Maybe<EnsName>
  updateOneOffchainRevocation?: Maybe<OffchainRevocation>
  updateOneSchema?: Maybe<Schema>
  updateOneSchemaName?: Maybe<SchemaName>
  updateOneServiceStat?: Maybe<ServiceStat>
  updateOneTimestamp?: Maybe<Timestamp>
  upsertOneAttestation: Attestation
  upsertOneEnsName: EnsName
  upsertOneOffchainRevocation: OffchainRevocation
  upsertOneSchema: Schema
  upsertOneSchemaName: SchemaName
  upsertOneServiceStat: ServiceStat
  upsertOneTimestamp: Timestamp
}

export type MutationCreateManyAttestationArgs = {
  data: Array<AttestationCreateManyInput>
  skipDuplicates?: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationCreateManyEnsNameArgs = {
  data: Array<EnsNameCreateManyInput>
  skipDuplicates?: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationCreateManyOffchainRevocationArgs = {
  data: Array<OffchainRevocationCreateManyInput>
  skipDuplicates?: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationCreateManySchemaArgs = {
  data: Array<SchemaCreateManyInput>
  skipDuplicates?: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationCreateManySchemaNameArgs = {
  data: Array<SchemaNameCreateManyInput>
  skipDuplicates?: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationCreateManyServiceStatArgs = {
  data: Array<ServiceStatCreateManyInput>
  skipDuplicates?: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationCreateManyTimestampArgs = {
  data: Array<TimestampCreateManyInput>
  skipDuplicates?: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationCreateOneAttestationArgs = {
  data: AttestationCreateInput
}

export type MutationCreateOneEnsNameArgs = {
  data: EnsNameCreateInput
}

export type MutationCreateOneOffchainRevocationArgs = {
  data: OffchainRevocationCreateInput
}

export type MutationCreateOneSchemaArgs = {
  data: SchemaCreateInput
}

export type MutationCreateOneSchemaNameArgs = {
  data: SchemaNameCreateInput
}

export type MutationCreateOneServiceStatArgs = {
  data: ServiceStatCreateInput
}

export type MutationCreateOneTimestampArgs = {
  data: TimestampCreateInput
}

export type MutationDeleteManyAttestationArgs = {
  where?: InputMaybe<AttestationWhereInput>
}

export type MutationDeleteManyEnsNameArgs = {
  where?: InputMaybe<EnsNameWhereInput>
}

export type MutationDeleteManyOffchainRevocationArgs = {
  where?: InputMaybe<OffchainRevocationWhereInput>
}

export type MutationDeleteManySchemaArgs = {
  where?: InputMaybe<SchemaWhereInput>
}

export type MutationDeleteManySchemaNameArgs = {
  where?: InputMaybe<SchemaNameWhereInput>
}

export type MutationDeleteManyServiceStatArgs = {
  where?: InputMaybe<ServiceStatWhereInput>
}

export type MutationDeleteManyTimestampArgs = {
  where?: InputMaybe<TimestampWhereInput>
}

export type MutationDeleteOneAttestationArgs = {
  where: AttestationWhereUniqueInput
}

export type MutationDeleteOneEnsNameArgs = {
  where: EnsNameWhereUniqueInput
}

export type MutationDeleteOneOffchainRevocationArgs = {
  where: OffchainRevocationWhereUniqueInput
}

export type MutationDeleteOneSchemaArgs = {
  where: SchemaWhereUniqueInput
}

export type MutationDeleteOneSchemaNameArgs = {
  where: SchemaNameWhereUniqueInput
}

export type MutationDeleteOneServiceStatArgs = {
  where: ServiceStatWhereUniqueInput
}

export type MutationDeleteOneTimestampArgs = {
  where: TimestampWhereUniqueInput
}

export type MutationUpdateManyAttestationArgs = {
  data: AttestationUpdateManyMutationInput
  where?: InputMaybe<AttestationWhereInput>
}

export type MutationUpdateManyEnsNameArgs = {
  data: EnsNameUpdateManyMutationInput
  where?: InputMaybe<EnsNameWhereInput>
}

export type MutationUpdateManyOffchainRevocationArgs = {
  data: OffchainRevocationUpdateManyMutationInput
  where?: InputMaybe<OffchainRevocationWhereInput>
}

export type MutationUpdateManySchemaArgs = {
  data: SchemaUpdateManyMutationInput
  where?: InputMaybe<SchemaWhereInput>
}

export type MutationUpdateManySchemaNameArgs = {
  data: SchemaNameUpdateManyMutationInput
  where?: InputMaybe<SchemaNameWhereInput>
}

export type MutationUpdateManyServiceStatArgs = {
  data: ServiceStatUpdateManyMutationInput
  where?: InputMaybe<ServiceStatWhereInput>
}

export type MutationUpdateManyTimestampArgs = {
  data: TimestampUpdateManyMutationInput
  where?: InputMaybe<TimestampWhereInput>
}

export type MutationUpdateOneAttestationArgs = {
  data: AttestationUpdateInput
  where: AttestationWhereUniqueInput
}

export type MutationUpdateOneEnsNameArgs = {
  data: EnsNameUpdateInput
  where: EnsNameWhereUniqueInput
}

export type MutationUpdateOneOffchainRevocationArgs = {
  data: OffchainRevocationUpdateInput
  where: OffchainRevocationWhereUniqueInput
}

export type MutationUpdateOneSchemaArgs = {
  data: SchemaUpdateInput
  where: SchemaWhereUniqueInput
}

export type MutationUpdateOneSchemaNameArgs = {
  data: SchemaNameUpdateInput
  where: SchemaNameWhereUniqueInput
}

export type MutationUpdateOneServiceStatArgs = {
  data: ServiceStatUpdateInput
  where: ServiceStatWhereUniqueInput
}

export type MutationUpdateOneTimestampArgs = {
  data: TimestampUpdateInput
  where: TimestampWhereUniqueInput
}

export type MutationUpsertOneAttestationArgs = {
  create: AttestationCreateInput
  update: AttestationUpdateInput
  where: AttestationWhereUniqueInput
}

export type MutationUpsertOneEnsNameArgs = {
  create: EnsNameCreateInput
  update: EnsNameUpdateInput
  where: EnsNameWhereUniqueInput
}

export type MutationUpsertOneOffchainRevocationArgs = {
  create: OffchainRevocationCreateInput
  update: OffchainRevocationUpdateInput
  where: OffchainRevocationWhereUniqueInput
}

export type MutationUpsertOneSchemaArgs = {
  create: SchemaCreateInput
  update: SchemaUpdateInput
  where: SchemaWhereUniqueInput
}

export type MutationUpsertOneSchemaNameArgs = {
  create: SchemaNameCreateInput
  update: SchemaNameUpdateInput
  where: SchemaNameWhereUniqueInput
}

export type MutationUpsertOneServiceStatArgs = {
  create: ServiceStatCreateInput
  update: ServiceStatUpdateInput
  where: ServiceStatWhereUniqueInput
}

export type MutationUpsertOneTimestampArgs = {
  create: TimestampCreateInput
  update: TimestampUpdateInput
  where: TimestampWhereUniqueInput
}

export type NestedBoolFilter = {
  equals?: InputMaybe<Scalars['Boolean']['input']>
  not?: InputMaybe<NestedBoolFilter>
}

export type NestedBoolWithAggregatesFilter = {
  _count?: InputMaybe<NestedIntFilter>
  _max?: InputMaybe<NestedBoolFilter>
  _min?: InputMaybe<NestedBoolFilter>
  equals?: InputMaybe<Scalars['Boolean']['input']>
  not?: InputMaybe<NestedBoolWithAggregatesFilter>
}

export type NestedFloatFilter = {
  equals?: InputMaybe<Scalars['Float']['input']>
  gt?: InputMaybe<Scalars['Float']['input']>
  gte?: InputMaybe<Scalars['Float']['input']>
  in?: InputMaybe<Array<Scalars['Float']['input']>>
  lt?: InputMaybe<Scalars['Float']['input']>
  lte?: InputMaybe<Scalars['Float']['input']>
  not?: InputMaybe<NestedFloatFilter>
  notIn?: InputMaybe<Array<Scalars['Float']['input']>>
}

export type NestedIntFilter = {
  equals?: InputMaybe<Scalars['Int']['input']>
  gt?: InputMaybe<Scalars['Int']['input']>
  gte?: InputMaybe<Scalars['Int']['input']>
  in?: InputMaybe<Array<Scalars['Int']['input']>>
  lt?: InputMaybe<Scalars['Int']['input']>
  lte?: InputMaybe<Scalars['Int']['input']>
  not?: InputMaybe<NestedIntFilter>
  notIn?: InputMaybe<Array<Scalars['Int']['input']>>
}

export type NestedIntWithAggregatesFilter = {
  _avg?: InputMaybe<NestedFloatFilter>
  _count?: InputMaybe<NestedIntFilter>
  _max?: InputMaybe<NestedIntFilter>
  _min?: InputMaybe<NestedIntFilter>
  _sum?: InputMaybe<NestedIntFilter>
  equals?: InputMaybe<Scalars['Int']['input']>
  gt?: InputMaybe<Scalars['Int']['input']>
  gte?: InputMaybe<Scalars['Int']['input']>
  in?: InputMaybe<Array<Scalars['Int']['input']>>
  lt?: InputMaybe<Scalars['Int']['input']>
  lte?: InputMaybe<Scalars['Int']['input']>
  not?: InputMaybe<NestedIntWithAggregatesFilter>
  notIn?: InputMaybe<Array<Scalars['Int']['input']>>
}

export type NestedStringFilter = {
  contains?: InputMaybe<Scalars['String']['input']>
  endsWith?: InputMaybe<Scalars['String']['input']>
  equals?: InputMaybe<Scalars['String']['input']>
  gt?: InputMaybe<Scalars['String']['input']>
  gte?: InputMaybe<Scalars['String']['input']>
  in?: InputMaybe<Array<Scalars['String']['input']>>
  lt?: InputMaybe<Scalars['String']['input']>
  lte?: InputMaybe<Scalars['String']['input']>
  not?: InputMaybe<NestedStringFilter>
  notIn?: InputMaybe<Array<Scalars['String']['input']>>
  startsWith?: InputMaybe<Scalars['String']['input']>
}

export type NestedStringWithAggregatesFilter = {
  _count?: InputMaybe<NestedIntFilter>
  _max?: InputMaybe<NestedStringFilter>
  _min?: InputMaybe<NestedStringFilter>
  contains?: InputMaybe<Scalars['String']['input']>
  endsWith?: InputMaybe<Scalars['String']['input']>
  equals?: InputMaybe<Scalars['String']['input']>
  gt?: InputMaybe<Scalars['String']['input']>
  gte?: InputMaybe<Scalars['String']['input']>
  in?: InputMaybe<Array<Scalars['String']['input']>>
  lt?: InputMaybe<Scalars['String']['input']>
  lte?: InputMaybe<Scalars['String']['input']>
  not?: InputMaybe<NestedStringWithAggregatesFilter>
  notIn?: InputMaybe<Array<Scalars['String']['input']>>
  startsWith?: InputMaybe<Scalars['String']['input']>
}

export type OffchainRevocation = {
  __typename?: 'OffchainRevocation'
  from: Scalars['String']['output']
  id: Scalars['String']['output']
  timestamp: Scalars['Int']['output']
  txid: Scalars['String']['output']
  uid: Scalars['String']['output']
}

export type OffchainRevocationAvgAggregate = {
  __typename?: 'OffchainRevocationAvgAggregate'
  timestamp?: Maybe<Scalars['Float']['output']>
}

export type OffchainRevocationAvgOrderByAggregateInput = {
  timestamp?: InputMaybe<SortOrder>
}

export type OffchainRevocationCountAggregate = {
  __typename?: 'OffchainRevocationCountAggregate'
  _all: Scalars['Int']['output']
  from: Scalars['Int']['output']
  id: Scalars['Int']['output']
  timestamp: Scalars['Int']['output']
  txid: Scalars['Int']['output']
  uid: Scalars['Int']['output']
}

export type OffchainRevocationCountOrderByAggregateInput = {
  from?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
  uid?: InputMaybe<SortOrder>
}

export type OffchainRevocationCreateInput = {
  from: Scalars['String']['input']
  id?: InputMaybe<Scalars['String']['input']>
  timestamp: Scalars['Int']['input']
  txid: Scalars['String']['input']
  uid: Scalars['String']['input']
}

export type OffchainRevocationCreateManyInput = {
  from: Scalars['String']['input']
  id?: InputMaybe<Scalars['String']['input']>
  timestamp: Scalars['Int']['input']
  txid: Scalars['String']['input']
  uid: Scalars['String']['input']
}

export type OffchainRevocationGroupBy = {
  __typename?: 'OffchainRevocationGroupBy'
  _avg?: Maybe<OffchainRevocationAvgAggregate>
  _count?: Maybe<OffchainRevocationCountAggregate>
  _max?: Maybe<OffchainRevocationMaxAggregate>
  _min?: Maybe<OffchainRevocationMinAggregate>
  _sum?: Maybe<OffchainRevocationSumAggregate>
  from: Scalars['String']['output']
  id: Scalars['String']['output']
  timestamp: Scalars['Int']['output']
  txid: Scalars['String']['output']
  uid: Scalars['String']['output']
}

export type OffchainRevocationMaxAggregate = {
  __typename?: 'OffchainRevocationMaxAggregate'
  from?: Maybe<Scalars['String']['output']>
  id?: Maybe<Scalars['String']['output']>
  timestamp?: Maybe<Scalars['Int']['output']>
  txid?: Maybe<Scalars['String']['output']>
  uid?: Maybe<Scalars['String']['output']>
}

export type OffchainRevocationMaxOrderByAggregateInput = {
  from?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
  uid?: InputMaybe<SortOrder>
}

export type OffchainRevocationMinAggregate = {
  __typename?: 'OffchainRevocationMinAggregate'
  from?: Maybe<Scalars['String']['output']>
  id?: Maybe<Scalars['String']['output']>
  timestamp?: Maybe<Scalars['Int']['output']>
  txid?: Maybe<Scalars['String']['output']>
  uid?: Maybe<Scalars['String']['output']>
}

export type OffchainRevocationMinOrderByAggregateInput = {
  from?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
  uid?: InputMaybe<SortOrder>
}

export type OffchainRevocationOrderByWithAggregationInput = {
  _avg?: InputMaybe<OffchainRevocationAvgOrderByAggregateInput>
  _count?: InputMaybe<OffchainRevocationCountOrderByAggregateInput>
  _max?: InputMaybe<OffchainRevocationMaxOrderByAggregateInput>
  _min?: InputMaybe<OffchainRevocationMinOrderByAggregateInput>
  _sum?: InputMaybe<OffchainRevocationSumOrderByAggregateInput>
  from?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
  uid?: InputMaybe<SortOrder>
}

export type OffchainRevocationOrderByWithRelationInput = {
  from?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
  uid?: InputMaybe<SortOrder>
}

export enum OffchainRevocationScalarFieldEnum {
  From = 'from',
  Id = 'id',
  Timestamp = 'timestamp',
  Txid = 'txid',
  Uid = 'uid',
}

export type OffchainRevocationScalarWhereWithAggregatesInput = {
  AND?: InputMaybe<Array<OffchainRevocationScalarWhereWithAggregatesInput>>
  NOT?: InputMaybe<Array<OffchainRevocationScalarWhereWithAggregatesInput>>
  OR?: InputMaybe<Array<OffchainRevocationScalarWhereWithAggregatesInput>>
  from?: InputMaybe<StringWithAggregatesFilter>
  id?: InputMaybe<StringWithAggregatesFilter>
  timestamp?: InputMaybe<IntWithAggregatesFilter>
  txid?: InputMaybe<StringWithAggregatesFilter>
  uid?: InputMaybe<StringWithAggregatesFilter>
}

export type OffchainRevocationSumAggregate = {
  __typename?: 'OffchainRevocationSumAggregate'
  timestamp?: Maybe<Scalars['Int']['output']>
}

export type OffchainRevocationSumOrderByAggregateInput = {
  timestamp?: InputMaybe<SortOrder>
}

export type OffchainRevocationUpdateInput = {
  from?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  timestamp?: InputMaybe<IntFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
  uid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type OffchainRevocationUpdateManyMutationInput = {
  from?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  timestamp?: InputMaybe<IntFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
  uid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type OffchainRevocationWhereInput = {
  AND?: InputMaybe<Array<OffchainRevocationWhereInput>>
  NOT?: InputMaybe<Array<OffchainRevocationWhereInput>>
  OR?: InputMaybe<Array<OffchainRevocationWhereInput>>
  from?: InputMaybe<StringFilter>
  id?: InputMaybe<StringFilter>
  timestamp?: InputMaybe<IntFilter>
  txid?: InputMaybe<StringFilter>
  uid?: InputMaybe<StringFilter>
}

export type OffchainRevocationWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']['input']>
}

export type Query = {
  __typename?: 'Query'
  aggregateAttestation: AggregateAttestation
  aggregateEnsName: AggregateEnsName
  aggregateOffchainRevocation: AggregateOffchainRevocation
  aggregateSchema: AggregateSchema
  aggregateSchemaName: AggregateSchemaName
  aggregateServiceStat: AggregateServiceStat
  aggregateTimestamp: AggregateTimestamp
  attestation?: Maybe<Attestation>
  attestations: Array<Attestation>
  ensName?: Maybe<EnsName>
  ensNames: Array<EnsName>
  findFirstAttestation?: Maybe<Attestation>
  findFirstAttestationOrThrow?: Maybe<Attestation>
  findFirstEnsName?: Maybe<EnsName>
  findFirstEnsNameOrThrow?: Maybe<EnsName>
  findFirstOffchainRevocation?: Maybe<OffchainRevocation>
  findFirstOffchainRevocationOrThrow?: Maybe<OffchainRevocation>
  findFirstSchema?: Maybe<Schema>
  findFirstSchemaName?: Maybe<SchemaName>
  findFirstSchemaNameOrThrow?: Maybe<SchemaName>
  findFirstSchemaOrThrow?: Maybe<Schema>
  findFirstServiceStat?: Maybe<ServiceStat>
  findFirstServiceStatOrThrow?: Maybe<ServiceStat>
  findFirstTimestamp?: Maybe<Timestamp>
  findFirstTimestampOrThrow?: Maybe<Timestamp>
  getAttestation?: Maybe<Attestation>
  getEnsName?: Maybe<EnsName>
  getOffchainRevocation?: Maybe<OffchainRevocation>
  getSchema?: Maybe<Schema>
  getSchemaName?: Maybe<SchemaName>
  getServiceStat?: Maybe<ServiceStat>
  getTimestamp?: Maybe<Timestamp>
  groupByAttestation: Array<AttestationGroupBy>
  groupByEnsName: Array<EnsNameGroupBy>
  groupByOffchainRevocation: Array<OffchainRevocationGroupBy>
  groupBySchema: Array<SchemaGroupBy>
  groupBySchemaName: Array<SchemaNameGroupBy>
  groupByServiceStat: Array<ServiceStatGroupBy>
  groupByTimestamp: Array<TimestampGroupBy>
  offchainRevocation?: Maybe<OffchainRevocation>
  offchainRevocations: Array<OffchainRevocation>
  schema?: Maybe<Schema>
  schemaName?: Maybe<SchemaName>
  schemaNames: Array<SchemaName>
  schemata: Array<Schema>
  serviceStat?: Maybe<ServiceStat>
  serviceStats: Array<ServiceStat>
  timestamp?: Maybe<Timestamp>
  timestamps: Array<Timestamp>
}

export type QueryAggregateAttestationArgs = {
  cursor?: InputMaybe<AttestationWhereUniqueInput>
  orderBy?: InputMaybe<Array<AttestationOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<AttestationWhereInput>
}

export type QueryAggregateEnsNameArgs = {
  cursor?: InputMaybe<EnsNameWhereUniqueInput>
  orderBy?: InputMaybe<Array<EnsNameOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<EnsNameWhereInput>
}

export type QueryAggregateOffchainRevocationArgs = {
  cursor?: InputMaybe<OffchainRevocationWhereUniqueInput>
  orderBy?: InputMaybe<Array<OffchainRevocationOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<OffchainRevocationWhereInput>
}

export type QueryAggregateSchemaArgs = {
  cursor?: InputMaybe<SchemaWhereUniqueInput>
  orderBy?: InputMaybe<Array<SchemaOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaWhereInput>
}

export type QueryAggregateSchemaNameArgs = {
  cursor?: InputMaybe<SchemaNameWhereUniqueInput>
  orderBy?: InputMaybe<Array<SchemaNameOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaNameWhereInput>
}

export type QueryAggregateServiceStatArgs = {
  cursor?: InputMaybe<ServiceStatWhereUniqueInput>
  orderBy?: InputMaybe<Array<ServiceStatOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ServiceStatWhereInput>
}

export type QueryAggregateTimestampArgs = {
  cursor?: InputMaybe<TimestampWhereUniqueInput>
  orderBy?: InputMaybe<Array<TimestampOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<TimestampWhereInput>
}

export type QueryAttestationArgs = {
  where: AttestationWhereUniqueInput
}

export type QueryAttestationsArgs = {
  cursor?: InputMaybe<AttestationWhereUniqueInput>
  distinct?: InputMaybe<Array<AttestationScalarFieldEnum>>
  orderBy?: InputMaybe<Array<AttestationOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<AttestationWhereInput>
}

export type QueryEnsNameArgs = {
  where: EnsNameWhereUniqueInput
}

export type QueryEnsNamesArgs = {
  cursor?: InputMaybe<EnsNameWhereUniqueInput>
  distinct?: InputMaybe<Array<EnsNameScalarFieldEnum>>
  orderBy?: InputMaybe<Array<EnsNameOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<EnsNameWhereInput>
}

export type QueryFindFirstAttestationArgs = {
  cursor?: InputMaybe<AttestationWhereUniqueInput>
  distinct?: InputMaybe<Array<AttestationScalarFieldEnum>>
  orderBy?: InputMaybe<Array<AttestationOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<AttestationWhereInput>
}

export type QueryFindFirstAttestationOrThrowArgs = {
  cursor?: InputMaybe<AttestationWhereUniqueInput>
  distinct?: InputMaybe<Array<AttestationScalarFieldEnum>>
  orderBy?: InputMaybe<Array<AttestationOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<AttestationWhereInput>
}

export type QueryFindFirstEnsNameArgs = {
  cursor?: InputMaybe<EnsNameWhereUniqueInput>
  distinct?: InputMaybe<Array<EnsNameScalarFieldEnum>>
  orderBy?: InputMaybe<Array<EnsNameOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<EnsNameWhereInput>
}

export type QueryFindFirstEnsNameOrThrowArgs = {
  cursor?: InputMaybe<EnsNameWhereUniqueInput>
  distinct?: InputMaybe<Array<EnsNameScalarFieldEnum>>
  orderBy?: InputMaybe<Array<EnsNameOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<EnsNameWhereInput>
}

export type QueryFindFirstOffchainRevocationArgs = {
  cursor?: InputMaybe<OffchainRevocationWhereUniqueInput>
  distinct?: InputMaybe<Array<OffchainRevocationScalarFieldEnum>>
  orderBy?: InputMaybe<Array<OffchainRevocationOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<OffchainRevocationWhereInput>
}

export type QueryFindFirstOffchainRevocationOrThrowArgs = {
  cursor?: InputMaybe<OffchainRevocationWhereUniqueInput>
  distinct?: InputMaybe<Array<OffchainRevocationScalarFieldEnum>>
  orderBy?: InputMaybe<Array<OffchainRevocationOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<OffchainRevocationWhereInput>
}

export type QueryFindFirstSchemaArgs = {
  cursor?: InputMaybe<SchemaWhereUniqueInput>
  distinct?: InputMaybe<Array<SchemaScalarFieldEnum>>
  orderBy?: InputMaybe<Array<SchemaOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaWhereInput>
}

export type QueryFindFirstSchemaNameArgs = {
  cursor?: InputMaybe<SchemaNameWhereUniqueInput>
  distinct?: InputMaybe<Array<SchemaNameScalarFieldEnum>>
  orderBy?: InputMaybe<Array<SchemaNameOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaNameWhereInput>
}

export type QueryFindFirstSchemaNameOrThrowArgs = {
  cursor?: InputMaybe<SchemaNameWhereUniqueInput>
  distinct?: InputMaybe<Array<SchemaNameScalarFieldEnum>>
  orderBy?: InputMaybe<Array<SchemaNameOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaNameWhereInput>
}

export type QueryFindFirstSchemaOrThrowArgs = {
  cursor?: InputMaybe<SchemaWhereUniqueInput>
  distinct?: InputMaybe<Array<SchemaScalarFieldEnum>>
  orderBy?: InputMaybe<Array<SchemaOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaWhereInput>
}

export type QueryFindFirstServiceStatArgs = {
  cursor?: InputMaybe<ServiceStatWhereUniqueInput>
  distinct?: InputMaybe<Array<ServiceStatScalarFieldEnum>>
  orderBy?: InputMaybe<Array<ServiceStatOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ServiceStatWhereInput>
}

export type QueryFindFirstServiceStatOrThrowArgs = {
  cursor?: InputMaybe<ServiceStatWhereUniqueInput>
  distinct?: InputMaybe<Array<ServiceStatScalarFieldEnum>>
  orderBy?: InputMaybe<Array<ServiceStatOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ServiceStatWhereInput>
}

export type QueryFindFirstTimestampArgs = {
  cursor?: InputMaybe<TimestampWhereUniqueInput>
  distinct?: InputMaybe<Array<TimestampScalarFieldEnum>>
  orderBy?: InputMaybe<Array<TimestampOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<TimestampWhereInput>
}

export type QueryFindFirstTimestampOrThrowArgs = {
  cursor?: InputMaybe<TimestampWhereUniqueInput>
  distinct?: InputMaybe<Array<TimestampScalarFieldEnum>>
  orderBy?: InputMaybe<Array<TimestampOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<TimestampWhereInput>
}

export type QueryGetAttestationArgs = {
  where: AttestationWhereUniqueInput
}

export type QueryGetEnsNameArgs = {
  where: EnsNameWhereUniqueInput
}

export type QueryGetOffchainRevocationArgs = {
  where: OffchainRevocationWhereUniqueInput
}

export type QueryGetSchemaArgs = {
  where: SchemaWhereUniqueInput
}

export type QueryGetSchemaNameArgs = {
  where: SchemaNameWhereUniqueInput
}

export type QueryGetServiceStatArgs = {
  where: ServiceStatWhereUniqueInput
}

export type QueryGetTimestampArgs = {
  where: TimestampWhereUniqueInput
}

export type QueryGroupByAttestationArgs = {
  by: Array<AttestationScalarFieldEnum>
  having?: InputMaybe<AttestationScalarWhereWithAggregatesInput>
  orderBy?: InputMaybe<Array<AttestationOrderByWithAggregationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<AttestationWhereInput>
}

export type QueryGroupByEnsNameArgs = {
  by: Array<EnsNameScalarFieldEnum>
  having?: InputMaybe<EnsNameScalarWhereWithAggregatesInput>
  orderBy?: InputMaybe<Array<EnsNameOrderByWithAggregationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<EnsNameWhereInput>
}

export type QueryGroupByOffchainRevocationArgs = {
  by: Array<OffchainRevocationScalarFieldEnum>
  having?: InputMaybe<OffchainRevocationScalarWhereWithAggregatesInput>
  orderBy?: InputMaybe<Array<OffchainRevocationOrderByWithAggregationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<OffchainRevocationWhereInput>
}

export type QueryGroupBySchemaArgs = {
  by: Array<SchemaScalarFieldEnum>
  having?: InputMaybe<SchemaScalarWhereWithAggregatesInput>
  orderBy?: InputMaybe<Array<SchemaOrderByWithAggregationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaWhereInput>
}

export type QueryGroupBySchemaNameArgs = {
  by: Array<SchemaNameScalarFieldEnum>
  having?: InputMaybe<SchemaNameScalarWhereWithAggregatesInput>
  orderBy?: InputMaybe<Array<SchemaNameOrderByWithAggregationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaNameWhereInput>
}

export type QueryGroupByServiceStatArgs = {
  by: Array<ServiceStatScalarFieldEnum>
  having?: InputMaybe<ServiceStatScalarWhereWithAggregatesInput>
  orderBy?: InputMaybe<Array<ServiceStatOrderByWithAggregationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ServiceStatWhereInput>
}

export type QueryGroupByTimestampArgs = {
  by: Array<TimestampScalarFieldEnum>
  having?: InputMaybe<TimestampScalarWhereWithAggregatesInput>
  orderBy?: InputMaybe<Array<TimestampOrderByWithAggregationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<TimestampWhereInput>
}

export type QueryOffchainRevocationArgs = {
  where: OffchainRevocationWhereUniqueInput
}

export type QueryOffchainRevocationsArgs = {
  cursor?: InputMaybe<OffchainRevocationWhereUniqueInput>
  distinct?: InputMaybe<Array<OffchainRevocationScalarFieldEnum>>
  orderBy?: InputMaybe<Array<OffchainRevocationOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<OffchainRevocationWhereInput>
}

export type QuerySchemaArgs = {
  where: SchemaWhereUniqueInput
}

export type QuerySchemaNameArgs = {
  where: SchemaNameWhereUniqueInput
}

export type QuerySchemaNamesArgs = {
  cursor?: InputMaybe<SchemaNameWhereUniqueInput>
  distinct?: InputMaybe<Array<SchemaNameScalarFieldEnum>>
  orderBy?: InputMaybe<Array<SchemaNameOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaNameWhereInput>
}

export type QuerySchemataArgs = {
  cursor?: InputMaybe<SchemaWhereUniqueInput>
  distinct?: InputMaybe<Array<SchemaScalarFieldEnum>>
  orderBy?: InputMaybe<Array<SchemaOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaWhereInput>
}

export type QueryServiceStatArgs = {
  where: ServiceStatWhereUniqueInput
}

export type QueryServiceStatsArgs = {
  cursor?: InputMaybe<ServiceStatWhereUniqueInput>
  distinct?: InputMaybe<Array<ServiceStatScalarFieldEnum>>
  orderBy?: InputMaybe<Array<ServiceStatOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ServiceStatWhereInput>
}

export type QueryTimestampArgs = {
  where: TimestampWhereUniqueInput
}

export type QueryTimestampsArgs = {
  cursor?: InputMaybe<TimestampWhereUniqueInput>
  distinct?: InputMaybe<Array<TimestampScalarFieldEnum>>
  orderBy?: InputMaybe<Array<TimestampOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<TimestampWhereInput>
}

export enum QueryMode {
  Default = 'default',
  Insensitive = 'insensitive',
}

export type Schema = {
  __typename?: 'Schema'
  _count?: Maybe<SchemaCount>
  attestations: Array<Attestation>
  creator: Scalars['String']['output']
  id: Scalars['String']['output']
  index: Scalars['String']['output']
  resolver: Scalars['String']['output']
  revocable: Scalars['Boolean']['output']
  schema: Scalars['String']['output']
  schemaNames: Array<SchemaName>
  time: Scalars['Int']['output']
  txid: Scalars['String']['output']
}

export type SchemaAttestationsArgs = {
  cursor?: InputMaybe<AttestationWhereUniqueInput>
  distinct?: InputMaybe<Array<AttestationScalarFieldEnum>>
  orderBy?: InputMaybe<Array<AttestationOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<AttestationWhereInput>
}

export type SchemaSchemaNamesArgs = {
  cursor?: InputMaybe<SchemaNameWhereUniqueInput>
  distinct?: InputMaybe<Array<SchemaNameScalarFieldEnum>>
  orderBy?: InputMaybe<Array<SchemaNameOrderByWithRelationInput>>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SchemaNameWhereInput>
}

export type SchemaAvgAggregate = {
  __typename?: 'SchemaAvgAggregate'
  time?: Maybe<Scalars['Float']['output']>
}

export type SchemaAvgOrderByAggregateInput = {
  time?: InputMaybe<SortOrder>
}

export type SchemaCount = {
  __typename?: 'SchemaCount'
  attestations: Scalars['Int']['output']
  schemaNames: Scalars['Int']['output']
}

export type SchemaCountAggregate = {
  __typename?: 'SchemaCountAggregate'
  _all: Scalars['Int']['output']
  creator: Scalars['Int']['output']
  id: Scalars['Int']['output']
  index: Scalars['Int']['output']
  resolver: Scalars['Int']['output']
  revocable: Scalars['Int']['output']
  schema: Scalars['Int']['output']
  time: Scalars['Int']['output']
  txid: Scalars['Int']['output']
}

export type SchemaCountOrderByAggregateInput = {
  creator?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  index?: InputMaybe<SortOrder>
  resolver?: InputMaybe<SortOrder>
  revocable?: InputMaybe<SortOrder>
  schema?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type SchemaCreateInput = {
  attestations?: InputMaybe<AttestationCreateNestedManyWithoutSchemaInput>
  creator: Scalars['String']['input']
  id: Scalars['String']['input']
  index: Scalars['String']['input']
  resolver: Scalars['String']['input']
  revocable: Scalars['Boolean']['input']
  schema: Scalars['String']['input']
  schemaNames?: InputMaybe<SchemaNameCreateNestedManyWithoutSchemaInput>
  time: Scalars['Int']['input']
  txid: Scalars['String']['input']
}

export type SchemaCreateManyInput = {
  creator: Scalars['String']['input']
  id: Scalars['String']['input']
  index: Scalars['String']['input']
  resolver: Scalars['String']['input']
  revocable: Scalars['Boolean']['input']
  schema: Scalars['String']['input']
  time: Scalars['Int']['input']
  txid: Scalars['String']['input']
}

export type SchemaCreateNestedOneWithoutAttestationsInput = {
  connect?: InputMaybe<SchemaWhereUniqueInput>
  connectOrCreate?: InputMaybe<SchemaCreateOrConnectWithoutAttestationsInput>
  create?: InputMaybe<SchemaCreateWithoutAttestationsInput>
}

export type SchemaCreateNestedOneWithoutSchemaNamesInput = {
  connect?: InputMaybe<SchemaWhereUniqueInput>
  connectOrCreate?: InputMaybe<SchemaCreateOrConnectWithoutSchemaNamesInput>
  create?: InputMaybe<SchemaCreateWithoutSchemaNamesInput>
}

export type SchemaCreateOrConnectWithoutAttestationsInput = {
  create: SchemaCreateWithoutAttestationsInput
  where: SchemaWhereUniqueInput
}

export type SchemaCreateOrConnectWithoutSchemaNamesInput = {
  create: SchemaCreateWithoutSchemaNamesInput
  where: SchemaWhereUniqueInput
}

export type SchemaCreateWithoutAttestationsInput = {
  creator: Scalars['String']['input']
  id: Scalars['String']['input']
  index: Scalars['String']['input']
  resolver: Scalars['String']['input']
  revocable: Scalars['Boolean']['input']
  schema: Scalars['String']['input']
  schemaNames?: InputMaybe<SchemaNameCreateNestedManyWithoutSchemaInput>
  time: Scalars['Int']['input']
  txid: Scalars['String']['input']
}

export type SchemaCreateWithoutSchemaNamesInput = {
  attestations?: InputMaybe<AttestationCreateNestedManyWithoutSchemaInput>
  creator: Scalars['String']['input']
  id: Scalars['String']['input']
  index: Scalars['String']['input']
  resolver: Scalars['String']['input']
  revocable: Scalars['Boolean']['input']
  schema: Scalars['String']['input']
  time: Scalars['Int']['input']
  txid: Scalars['String']['input']
}

export type SchemaGroupBy = {
  __typename?: 'SchemaGroupBy'
  _avg?: Maybe<SchemaAvgAggregate>
  _count?: Maybe<SchemaCountAggregate>
  _max?: Maybe<SchemaMaxAggregate>
  _min?: Maybe<SchemaMinAggregate>
  _sum?: Maybe<SchemaSumAggregate>
  creator: Scalars['String']['output']
  id: Scalars['String']['output']
  index: Scalars['String']['output']
  resolver: Scalars['String']['output']
  revocable: Scalars['Boolean']['output']
  schema: Scalars['String']['output']
  time: Scalars['Int']['output']
  txid: Scalars['String']['output']
}

export type SchemaMaxAggregate = {
  __typename?: 'SchemaMaxAggregate'
  creator?: Maybe<Scalars['String']['output']>
  id?: Maybe<Scalars['String']['output']>
  index?: Maybe<Scalars['String']['output']>
  resolver?: Maybe<Scalars['String']['output']>
  revocable?: Maybe<Scalars['Boolean']['output']>
  schema?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['Int']['output']>
  txid?: Maybe<Scalars['String']['output']>
}

export type SchemaMaxOrderByAggregateInput = {
  creator?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  index?: InputMaybe<SortOrder>
  resolver?: InputMaybe<SortOrder>
  revocable?: InputMaybe<SortOrder>
  schema?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type SchemaMinAggregate = {
  __typename?: 'SchemaMinAggregate'
  creator?: Maybe<Scalars['String']['output']>
  id?: Maybe<Scalars['String']['output']>
  index?: Maybe<Scalars['String']['output']>
  resolver?: Maybe<Scalars['String']['output']>
  revocable?: Maybe<Scalars['Boolean']['output']>
  schema?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['Int']['output']>
  txid?: Maybe<Scalars['String']['output']>
}

export type SchemaMinOrderByAggregateInput = {
  creator?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  index?: InputMaybe<SortOrder>
  resolver?: InputMaybe<SortOrder>
  revocable?: InputMaybe<SortOrder>
  schema?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type SchemaName = {
  __typename?: 'SchemaName'
  attesterAddress: Scalars['String']['output']
  id: Scalars['String']['output']
  isCreator: Scalars['Boolean']['output']
  name: Scalars['String']['output']
  schema: Schema
  schemaId: Scalars['String']['output']
  time: Scalars['Int']['output']
}

export type SchemaNameAvgAggregate = {
  __typename?: 'SchemaNameAvgAggregate'
  time?: Maybe<Scalars['Float']['output']>
}

export type SchemaNameAvgOrderByAggregateInput = {
  time?: InputMaybe<SortOrder>
}

export type SchemaNameCountAggregate = {
  __typename?: 'SchemaNameCountAggregate'
  _all: Scalars['Int']['output']
  attesterAddress: Scalars['Int']['output']
  id: Scalars['Int']['output']
  isCreator: Scalars['Int']['output']
  name: Scalars['Int']['output']
  schemaId: Scalars['Int']['output']
  time: Scalars['Int']['output']
}

export type SchemaNameCountOrderByAggregateInput = {
  attesterAddress?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  isCreator?: InputMaybe<SortOrder>
  name?: InputMaybe<SortOrder>
  schemaId?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
}

export type SchemaNameCreateInput = {
  attesterAddress: Scalars['String']['input']
  id?: InputMaybe<Scalars['String']['input']>
  isCreator: Scalars['Boolean']['input']
  name: Scalars['String']['input']
  schema: SchemaCreateNestedOneWithoutSchemaNamesInput
  time: Scalars['Int']['input']
}

export type SchemaNameCreateManyInput = {
  attesterAddress: Scalars['String']['input']
  id?: InputMaybe<Scalars['String']['input']>
  isCreator: Scalars['Boolean']['input']
  name: Scalars['String']['input']
  schemaId: Scalars['String']['input']
  time: Scalars['Int']['input']
}

export type SchemaNameCreateManySchemaInput = {
  attesterAddress: Scalars['String']['input']
  id?: InputMaybe<Scalars['String']['input']>
  isCreator: Scalars['Boolean']['input']
  name: Scalars['String']['input']
  time: Scalars['Int']['input']
}

export type SchemaNameCreateManySchemaInputEnvelope = {
  data: Array<SchemaNameCreateManySchemaInput>
  skipDuplicates?: InputMaybe<Scalars['Boolean']['input']>
}

export type SchemaNameCreateNestedManyWithoutSchemaInput = {
  connect?: InputMaybe<Array<SchemaNameWhereUniqueInput>>
  connectOrCreate?: InputMaybe<Array<SchemaNameCreateOrConnectWithoutSchemaInput>>
  create?: InputMaybe<Array<SchemaNameCreateWithoutSchemaInput>>
  createMany?: InputMaybe<SchemaNameCreateManySchemaInputEnvelope>
}

export type SchemaNameCreateOrConnectWithoutSchemaInput = {
  create: SchemaNameCreateWithoutSchemaInput
  where: SchemaNameWhereUniqueInput
}

export type SchemaNameCreateWithoutSchemaInput = {
  attesterAddress: Scalars['String']['input']
  id?: InputMaybe<Scalars['String']['input']>
  isCreator: Scalars['Boolean']['input']
  name: Scalars['String']['input']
  time: Scalars['Int']['input']
}

export type SchemaNameGroupBy = {
  __typename?: 'SchemaNameGroupBy'
  _avg?: Maybe<SchemaNameAvgAggregate>
  _count?: Maybe<SchemaNameCountAggregate>
  _max?: Maybe<SchemaNameMaxAggregate>
  _min?: Maybe<SchemaNameMinAggregate>
  _sum?: Maybe<SchemaNameSumAggregate>
  attesterAddress: Scalars['String']['output']
  id: Scalars['String']['output']
  isCreator: Scalars['Boolean']['output']
  name: Scalars['String']['output']
  schemaId: Scalars['String']['output']
  time: Scalars['Int']['output']
}

export type SchemaNameListRelationFilter = {
  every?: InputMaybe<SchemaNameWhereInput>
  none?: InputMaybe<SchemaNameWhereInput>
  some?: InputMaybe<SchemaNameWhereInput>
}

export type SchemaNameMaxAggregate = {
  __typename?: 'SchemaNameMaxAggregate'
  attesterAddress?: Maybe<Scalars['String']['output']>
  id?: Maybe<Scalars['String']['output']>
  isCreator?: Maybe<Scalars['Boolean']['output']>
  name?: Maybe<Scalars['String']['output']>
  schemaId?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['Int']['output']>
}

export type SchemaNameMaxOrderByAggregateInput = {
  attesterAddress?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  isCreator?: InputMaybe<SortOrder>
  name?: InputMaybe<SortOrder>
  schemaId?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
}

export type SchemaNameMinAggregate = {
  __typename?: 'SchemaNameMinAggregate'
  attesterAddress?: Maybe<Scalars['String']['output']>
  id?: Maybe<Scalars['String']['output']>
  isCreator?: Maybe<Scalars['Boolean']['output']>
  name?: Maybe<Scalars['String']['output']>
  schemaId?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['Int']['output']>
}

export type SchemaNameMinOrderByAggregateInput = {
  attesterAddress?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  isCreator?: InputMaybe<SortOrder>
  name?: InputMaybe<SortOrder>
  schemaId?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
}

export type SchemaNameOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>
}

export type SchemaNameOrderByWithAggregationInput = {
  _avg?: InputMaybe<SchemaNameAvgOrderByAggregateInput>
  _count?: InputMaybe<SchemaNameCountOrderByAggregateInput>
  _max?: InputMaybe<SchemaNameMaxOrderByAggregateInput>
  _min?: InputMaybe<SchemaNameMinOrderByAggregateInput>
  _sum?: InputMaybe<SchemaNameSumOrderByAggregateInput>
  attesterAddress?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  isCreator?: InputMaybe<SortOrder>
  name?: InputMaybe<SortOrder>
  schemaId?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
}

export type SchemaNameOrderByWithRelationInput = {
  attesterAddress?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  isCreator?: InputMaybe<SortOrder>
  name?: InputMaybe<SortOrder>
  schema?: InputMaybe<SchemaOrderByWithRelationInput>
  schemaId?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
}

export enum SchemaNameScalarFieldEnum {
  AttesterAddress = 'attesterAddress',
  Id = 'id',
  IsCreator = 'isCreator',
  Name = 'name',
  SchemaId = 'schemaId',
  Time = 'time',
}

export type SchemaNameScalarWhereInput = {
  AND?: InputMaybe<Array<SchemaNameScalarWhereInput>>
  NOT?: InputMaybe<Array<SchemaNameScalarWhereInput>>
  OR?: InputMaybe<Array<SchemaNameScalarWhereInput>>
  attesterAddress?: InputMaybe<StringFilter>
  id?: InputMaybe<StringFilter>
  isCreator?: InputMaybe<BoolFilter>
  name?: InputMaybe<StringFilter>
  schemaId?: InputMaybe<StringFilter>
  time?: InputMaybe<IntFilter>
}

export type SchemaNameScalarWhereWithAggregatesInput = {
  AND?: InputMaybe<Array<SchemaNameScalarWhereWithAggregatesInput>>
  NOT?: InputMaybe<Array<SchemaNameScalarWhereWithAggregatesInput>>
  OR?: InputMaybe<Array<SchemaNameScalarWhereWithAggregatesInput>>
  attesterAddress?: InputMaybe<StringWithAggregatesFilter>
  id?: InputMaybe<StringWithAggregatesFilter>
  isCreator?: InputMaybe<BoolWithAggregatesFilter>
  name?: InputMaybe<StringWithAggregatesFilter>
  schemaId?: InputMaybe<StringWithAggregatesFilter>
  time?: InputMaybe<IntWithAggregatesFilter>
}

export type SchemaNameSumAggregate = {
  __typename?: 'SchemaNameSumAggregate'
  time?: Maybe<Scalars['Int']['output']>
}

export type SchemaNameSumOrderByAggregateInput = {
  time?: InputMaybe<SortOrder>
}

export type SchemaNameUpdateInput = {
  attesterAddress?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  isCreator?: InputMaybe<BoolFieldUpdateOperationsInput>
  name?: InputMaybe<StringFieldUpdateOperationsInput>
  schema?: InputMaybe<SchemaUpdateOneRequiredWithoutSchemaNamesNestedInput>
  time?: InputMaybe<IntFieldUpdateOperationsInput>
}

export type SchemaNameUpdateManyMutationInput = {
  attesterAddress?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  isCreator?: InputMaybe<BoolFieldUpdateOperationsInput>
  name?: InputMaybe<StringFieldUpdateOperationsInput>
  time?: InputMaybe<IntFieldUpdateOperationsInput>
}

export type SchemaNameUpdateManyWithWhereWithoutSchemaInput = {
  data: SchemaNameUpdateManyMutationInput
  where: SchemaNameScalarWhereInput
}

export type SchemaNameUpdateManyWithoutSchemaNestedInput = {
  connect?: InputMaybe<Array<SchemaNameWhereUniqueInput>>
  connectOrCreate?: InputMaybe<Array<SchemaNameCreateOrConnectWithoutSchemaInput>>
  create?: InputMaybe<Array<SchemaNameCreateWithoutSchemaInput>>
  createMany?: InputMaybe<SchemaNameCreateManySchemaInputEnvelope>
  delete?: InputMaybe<Array<SchemaNameWhereUniqueInput>>
  deleteMany?: InputMaybe<Array<SchemaNameScalarWhereInput>>
  disconnect?: InputMaybe<Array<SchemaNameWhereUniqueInput>>
  set?: InputMaybe<Array<SchemaNameWhereUniqueInput>>
  update?: InputMaybe<Array<SchemaNameUpdateWithWhereUniqueWithoutSchemaInput>>
  updateMany?: InputMaybe<Array<SchemaNameUpdateManyWithWhereWithoutSchemaInput>>
  upsert?: InputMaybe<Array<SchemaNameUpsertWithWhereUniqueWithoutSchemaInput>>
}

export type SchemaNameUpdateWithWhereUniqueWithoutSchemaInput = {
  data: SchemaNameUpdateWithoutSchemaInput
  where: SchemaNameWhereUniqueInput
}

export type SchemaNameUpdateWithoutSchemaInput = {
  attesterAddress?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  isCreator?: InputMaybe<BoolFieldUpdateOperationsInput>
  name?: InputMaybe<StringFieldUpdateOperationsInput>
  time?: InputMaybe<IntFieldUpdateOperationsInput>
}

export type SchemaNameUpsertWithWhereUniqueWithoutSchemaInput = {
  create: SchemaNameCreateWithoutSchemaInput
  update: SchemaNameUpdateWithoutSchemaInput
  where: SchemaNameWhereUniqueInput
}

export type SchemaNameWhereInput = {
  AND?: InputMaybe<Array<SchemaNameWhereInput>>
  NOT?: InputMaybe<Array<SchemaNameWhereInput>>
  OR?: InputMaybe<Array<SchemaNameWhereInput>>
  attesterAddress?: InputMaybe<StringFilter>
  id?: InputMaybe<StringFilter>
  isCreator?: InputMaybe<BoolFilter>
  name?: InputMaybe<StringFilter>
  schema?: InputMaybe<SchemaRelationFilter>
  schemaId?: InputMaybe<StringFilter>
  time?: InputMaybe<IntFilter>
}

export type SchemaNameWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']['input']>
}

export type SchemaOrderByWithAggregationInput = {
  _avg?: InputMaybe<SchemaAvgOrderByAggregateInput>
  _count?: InputMaybe<SchemaCountOrderByAggregateInput>
  _max?: InputMaybe<SchemaMaxOrderByAggregateInput>
  _min?: InputMaybe<SchemaMinOrderByAggregateInput>
  _sum?: InputMaybe<SchemaSumOrderByAggregateInput>
  creator?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  index?: InputMaybe<SortOrder>
  resolver?: InputMaybe<SortOrder>
  revocable?: InputMaybe<SortOrder>
  schema?: InputMaybe<SortOrder>
  time?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type SchemaOrderByWithRelationInput = {
  attestations?: InputMaybe<AttestationOrderByRelationAggregateInput>
  creator?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  index?: InputMaybe<SortOrder>
  resolver?: InputMaybe<SortOrder>
  revocable?: InputMaybe<SortOrder>
  schema?: InputMaybe<SortOrder>
  schemaNames?: InputMaybe<SchemaNameOrderByRelationAggregateInput>
  time?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type SchemaRelationFilter = {
  is?: InputMaybe<SchemaWhereInput>
  isNot?: InputMaybe<SchemaWhereInput>
}

export enum SchemaScalarFieldEnum {
  Creator = 'creator',
  Id = 'id',
  Index = 'index',
  Resolver = 'resolver',
  Revocable = 'revocable',
  Schema = 'schema',
  Time = 'time',
  Txid = 'txid',
}

export type SchemaScalarWhereWithAggregatesInput = {
  AND?: InputMaybe<Array<SchemaScalarWhereWithAggregatesInput>>
  NOT?: InputMaybe<Array<SchemaScalarWhereWithAggregatesInput>>
  OR?: InputMaybe<Array<SchemaScalarWhereWithAggregatesInput>>
  creator?: InputMaybe<StringWithAggregatesFilter>
  id?: InputMaybe<StringWithAggregatesFilter>
  index?: InputMaybe<StringWithAggregatesFilter>
  resolver?: InputMaybe<StringWithAggregatesFilter>
  revocable?: InputMaybe<BoolWithAggregatesFilter>
  schema?: InputMaybe<StringWithAggregatesFilter>
  time?: InputMaybe<IntWithAggregatesFilter>
  txid?: InputMaybe<StringWithAggregatesFilter>
}

export type SchemaSumAggregate = {
  __typename?: 'SchemaSumAggregate'
  time?: Maybe<Scalars['Int']['output']>
}

export type SchemaSumOrderByAggregateInput = {
  time?: InputMaybe<SortOrder>
}

export type SchemaUpdateInput = {
  attestations?: InputMaybe<AttestationUpdateManyWithoutSchemaNestedInput>
  creator?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  index?: InputMaybe<StringFieldUpdateOperationsInput>
  resolver?: InputMaybe<StringFieldUpdateOperationsInput>
  revocable?: InputMaybe<BoolFieldUpdateOperationsInput>
  schema?: InputMaybe<StringFieldUpdateOperationsInput>
  schemaNames?: InputMaybe<SchemaNameUpdateManyWithoutSchemaNestedInput>
  time?: InputMaybe<IntFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type SchemaUpdateManyMutationInput = {
  creator?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  index?: InputMaybe<StringFieldUpdateOperationsInput>
  resolver?: InputMaybe<StringFieldUpdateOperationsInput>
  revocable?: InputMaybe<BoolFieldUpdateOperationsInput>
  schema?: InputMaybe<StringFieldUpdateOperationsInput>
  time?: InputMaybe<IntFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type SchemaUpdateOneRequiredWithoutAttestationsNestedInput = {
  connect?: InputMaybe<SchemaWhereUniqueInput>
  connectOrCreate?: InputMaybe<SchemaCreateOrConnectWithoutAttestationsInput>
  create?: InputMaybe<SchemaCreateWithoutAttestationsInput>
  update?: InputMaybe<SchemaUpdateWithoutAttestationsInput>
  upsert?: InputMaybe<SchemaUpsertWithoutAttestationsInput>
}

export type SchemaUpdateOneRequiredWithoutSchemaNamesNestedInput = {
  connect?: InputMaybe<SchemaWhereUniqueInput>
  connectOrCreate?: InputMaybe<SchemaCreateOrConnectWithoutSchemaNamesInput>
  create?: InputMaybe<SchemaCreateWithoutSchemaNamesInput>
  update?: InputMaybe<SchemaUpdateWithoutSchemaNamesInput>
  upsert?: InputMaybe<SchemaUpsertWithoutSchemaNamesInput>
}

export type SchemaUpdateWithoutAttestationsInput = {
  creator?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  index?: InputMaybe<StringFieldUpdateOperationsInput>
  resolver?: InputMaybe<StringFieldUpdateOperationsInput>
  revocable?: InputMaybe<BoolFieldUpdateOperationsInput>
  schema?: InputMaybe<StringFieldUpdateOperationsInput>
  schemaNames?: InputMaybe<SchemaNameUpdateManyWithoutSchemaNestedInput>
  time?: InputMaybe<IntFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type SchemaUpdateWithoutSchemaNamesInput = {
  attestations?: InputMaybe<AttestationUpdateManyWithoutSchemaNestedInput>
  creator?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  index?: InputMaybe<StringFieldUpdateOperationsInput>
  resolver?: InputMaybe<StringFieldUpdateOperationsInput>
  revocable?: InputMaybe<BoolFieldUpdateOperationsInput>
  schema?: InputMaybe<StringFieldUpdateOperationsInput>
  time?: InputMaybe<IntFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type SchemaUpsertWithoutAttestationsInput = {
  create: SchemaCreateWithoutAttestationsInput
  update: SchemaUpdateWithoutAttestationsInput
}

export type SchemaUpsertWithoutSchemaNamesInput = {
  create: SchemaCreateWithoutSchemaNamesInput
  update: SchemaUpdateWithoutSchemaNamesInput
}

export type SchemaWhereInput = {
  AND?: InputMaybe<Array<SchemaWhereInput>>
  NOT?: InputMaybe<Array<SchemaWhereInput>>
  OR?: InputMaybe<Array<SchemaWhereInput>>
  attestations?: InputMaybe<AttestationListRelationFilter>
  creator?: InputMaybe<StringFilter>
  id?: InputMaybe<StringFilter>
  index?: InputMaybe<StringFilter>
  resolver?: InputMaybe<StringFilter>
  revocable?: InputMaybe<BoolFilter>
  schema?: InputMaybe<StringFilter>
  schemaNames?: InputMaybe<SchemaNameListRelationFilter>
  time?: InputMaybe<IntFilter>
  txid?: InputMaybe<StringFilter>
}

export type SchemaWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']['input']>
}

export type ServiceStat = {
  __typename?: 'ServiceStat'
  name: Scalars['String']['output']
  value: Scalars['String']['output']
}

export type ServiceStatCountAggregate = {
  __typename?: 'ServiceStatCountAggregate'
  _all: Scalars['Int']['output']
  name: Scalars['Int']['output']
  value: Scalars['Int']['output']
}

export type ServiceStatCountOrderByAggregateInput = {
  name?: InputMaybe<SortOrder>
  value?: InputMaybe<SortOrder>
}

export type ServiceStatCreateInput = {
  name: Scalars['String']['input']
  value: Scalars['String']['input']
}

export type ServiceStatCreateManyInput = {
  name: Scalars['String']['input']
  value: Scalars['String']['input']
}

export type ServiceStatGroupBy = {
  __typename?: 'ServiceStatGroupBy'
  _count?: Maybe<ServiceStatCountAggregate>
  _max?: Maybe<ServiceStatMaxAggregate>
  _min?: Maybe<ServiceStatMinAggregate>
  name: Scalars['String']['output']
  value: Scalars['String']['output']
}

export type ServiceStatMaxAggregate = {
  __typename?: 'ServiceStatMaxAggregate'
  name?: Maybe<Scalars['String']['output']>
  value?: Maybe<Scalars['String']['output']>
}

export type ServiceStatMaxOrderByAggregateInput = {
  name?: InputMaybe<SortOrder>
  value?: InputMaybe<SortOrder>
}

export type ServiceStatMinAggregate = {
  __typename?: 'ServiceStatMinAggregate'
  name?: Maybe<Scalars['String']['output']>
  value?: Maybe<Scalars['String']['output']>
}

export type ServiceStatMinOrderByAggregateInput = {
  name?: InputMaybe<SortOrder>
  value?: InputMaybe<SortOrder>
}

export type ServiceStatOrderByWithAggregationInput = {
  _count?: InputMaybe<ServiceStatCountOrderByAggregateInput>
  _max?: InputMaybe<ServiceStatMaxOrderByAggregateInput>
  _min?: InputMaybe<ServiceStatMinOrderByAggregateInput>
  name?: InputMaybe<SortOrder>
  value?: InputMaybe<SortOrder>
}

export type ServiceStatOrderByWithRelationInput = {
  name?: InputMaybe<SortOrder>
  value?: InputMaybe<SortOrder>
}

export enum ServiceStatScalarFieldEnum {
  Name = 'name',
  Value = 'value',
}

export type ServiceStatScalarWhereWithAggregatesInput = {
  AND?: InputMaybe<Array<ServiceStatScalarWhereWithAggregatesInput>>
  NOT?: InputMaybe<Array<ServiceStatScalarWhereWithAggregatesInput>>
  OR?: InputMaybe<Array<ServiceStatScalarWhereWithAggregatesInput>>
  name?: InputMaybe<StringWithAggregatesFilter>
  value?: InputMaybe<StringWithAggregatesFilter>
}

export type ServiceStatUpdateInput = {
  name?: InputMaybe<StringFieldUpdateOperationsInput>
  value?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type ServiceStatUpdateManyMutationInput = {
  name?: InputMaybe<StringFieldUpdateOperationsInput>
  value?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type ServiceStatWhereInput = {
  AND?: InputMaybe<Array<ServiceStatWhereInput>>
  NOT?: InputMaybe<Array<ServiceStatWhereInput>>
  OR?: InputMaybe<Array<ServiceStatWhereInput>>
  name?: InputMaybe<StringFilter>
  value?: InputMaybe<StringFilter>
}

export type ServiceStatWhereUniqueInput = {
  name?: InputMaybe<Scalars['String']['input']>
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export type StringFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['String']['input']>
}

export type StringFilter = {
  contains?: InputMaybe<Scalars['String']['input']>
  endsWith?: InputMaybe<Scalars['String']['input']>
  equals?: InputMaybe<Scalars['String']['input']>
  gt?: InputMaybe<Scalars['String']['input']>
  gte?: InputMaybe<Scalars['String']['input']>
  in?: InputMaybe<Array<Scalars['String']['input']>>
  lt?: InputMaybe<Scalars['String']['input']>
  lte?: InputMaybe<Scalars['String']['input']>
  mode?: InputMaybe<QueryMode>
  not?: InputMaybe<NestedStringFilter>
  notIn?: InputMaybe<Array<Scalars['String']['input']>>
  startsWith?: InputMaybe<Scalars['String']['input']>
}

export type StringWithAggregatesFilter = {
  _count?: InputMaybe<NestedIntFilter>
  _max?: InputMaybe<NestedStringFilter>
  _min?: InputMaybe<NestedStringFilter>
  contains?: InputMaybe<Scalars['String']['input']>
  endsWith?: InputMaybe<Scalars['String']['input']>
  equals?: InputMaybe<Scalars['String']['input']>
  gt?: InputMaybe<Scalars['String']['input']>
  gte?: InputMaybe<Scalars['String']['input']>
  in?: InputMaybe<Array<Scalars['String']['input']>>
  lt?: InputMaybe<Scalars['String']['input']>
  lte?: InputMaybe<Scalars['String']['input']>
  mode?: InputMaybe<QueryMode>
  not?: InputMaybe<NestedStringWithAggregatesFilter>
  notIn?: InputMaybe<Array<Scalars['String']['input']>>
  startsWith?: InputMaybe<Scalars['String']['input']>
}

export type Timestamp = {
  __typename?: 'Timestamp'
  from: Scalars['String']['output']
  id: Scalars['String']['output']
  timestamp: Scalars['Int']['output']
  tree: Scalars['String']['output']
  txid: Scalars['String']['output']
}

export type TimestampAvgAggregate = {
  __typename?: 'TimestampAvgAggregate'
  timestamp?: Maybe<Scalars['Float']['output']>
}

export type TimestampAvgOrderByAggregateInput = {
  timestamp?: InputMaybe<SortOrder>
}

export type TimestampCountAggregate = {
  __typename?: 'TimestampCountAggregate'
  _all: Scalars['Int']['output']
  from: Scalars['Int']['output']
  id: Scalars['Int']['output']
  timestamp: Scalars['Int']['output']
  tree: Scalars['Int']['output']
  txid: Scalars['Int']['output']
}

export type TimestampCountOrderByAggregateInput = {
  from?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
  tree?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type TimestampCreateInput = {
  from: Scalars['String']['input']
  id: Scalars['String']['input']
  timestamp: Scalars['Int']['input']
  tree?: InputMaybe<Scalars['String']['input']>
  txid: Scalars['String']['input']
}

export type TimestampCreateManyInput = {
  from: Scalars['String']['input']
  id: Scalars['String']['input']
  timestamp: Scalars['Int']['input']
  tree?: InputMaybe<Scalars['String']['input']>
  txid: Scalars['String']['input']
}

export type TimestampGroupBy = {
  __typename?: 'TimestampGroupBy'
  _avg?: Maybe<TimestampAvgAggregate>
  _count?: Maybe<TimestampCountAggregate>
  _max?: Maybe<TimestampMaxAggregate>
  _min?: Maybe<TimestampMinAggregate>
  _sum?: Maybe<TimestampSumAggregate>
  from: Scalars['String']['output']
  id: Scalars['String']['output']
  timestamp: Scalars['Int']['output']
  tree: Scalars['String']['output']
  txid: Scalars['String']['output']
}

export type TimestampMaxAggregate = {
  __typename?: 'TimestampMaxAggregate'
  from?: Maybe<Scalars['String']['output']>
  id?: Maybe<Scalars['String']['output']>
  timestamp?: Maybe<Scalars['Int']['output']>
  tree?: Maybe<Scalars['String']['output']>
  txid?: Maybe<Scalars['String']['output']>
}

export type TimestampMaxOrderByAggregateInput = {
  from?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
  tree?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type TimestampMinAggregate = {
  __typename?: 'TimestampMinAggregate'
  from?: Maybe<Scalars['String']['output']>
  id?: Maybe<Scalars['String']['output']>
  timestamp?: Maybe<Scalars['Int']['output']>
  tree?: Maybe<Scalars['String']['output']>
  txid?: Maybe<Scalars['String']['output']>
}

export type TimestampMinOrderByAggregateInput = {
  from?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
  tree?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type TimestampOrderByWithAggregationInput = {
  _avg?: InputMaybe<TimestampAvgOrderByAggregateInput>
  _count?: InputMaybe<TimestampCountOrderByAggregateInput>
  _max?: InputMaybe<TimestampMaxOrderByAggregateInput>
  _min?: InputMaybe<TimestampMinOrderByAggregateInput>
  _sum?: InputMaybe<TimestampSumOrderByAggregateInput>
  from?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
  tree?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export type TimestampOrderByWithRelationInput = {
  from?: InputMaybe<SortOrder>
  id?: InputMaybe<SortOrder>
  timestamp?: InputMaybe<SortOrder>
  tree?: InputMaybe<SortOrder>
  txid?: InputMaybe<SortOrder>
}

export enum TimestampScalarFieldEnum {
  From = 'from',
  Id = 'id',
  Timestamp = 'timestamp',
  Tree = 'tree',
  Txid = 'txid',
}

export type TimestampScalarWhereWithAggregatesInput = {
  AND?: InputMaybe<Array<TimestampScalarWhereWithAggregatesInput>>
  NOT?: InputMaybe<Array<TimestampScalarWhereWithAggregatesInput>>
  OR?: InputMaybe<Array<TimestampScalarWhereWithAggregatesInput>>
  from?: InputMaybe<StringWithAggregatesFilter>
  id?: InputMaybe<StringWithAggregatesFilter>
  timestamp?: InputMaybe<IntWithAggregatesFilter>
  tree?: InputMaybe<StringWithAggregatesFilter>
  txid?: InputMaybe<StringWithAggregatesFilter>
}

export type TimestampSumAggregate = {
  __typename?: 'TimestampSumAggregate'
  timestamp?: Maybe<Scalars['Int']['output']>
}

export type TimestampSumOrderByAggregateInput = {
  timestamp?: InputMaybe<SortOrder>
}

export type TimestampUpdateInput = {
  from?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  timestamp?: InputMaybe<IntFieldUpdateOperationsInput>
  tree?: InputMaybe<StringFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type TimestampUpdateManyMutationInput = {
  from?: InputMaybe<StringFieldUpdateOperationsInput>
  id?: InputMaybe<StringFieldUpdateOperationsInput>
  timestamp?: InputMaybe<IntFieldUpdateOperationsInput>
  tree?: InputMaybe<StringFieldUpdateOperationsInput>
  txid?: InputMaybe<StringFieldUpdateOperationsInput>
}

export type TimestampWhereInput = {
  AND?: InputMaybe<Array<TimestampWhereInput>>
  NOT?: InputMaybe<Array<TimestampWhereInput>>
  OR?: InputMaybe<Array<TimestampWhereInput>>
  from?: InputMaybe<StringFilter>
  id?: InputMaybe<StringFilter>
  timestamp?: InputMaybe<IntFilter>
  tree?: InputMaybe<StringFilter>
  txid?: InputMaybe<StringFilter>
}

export type TimestampWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']['input']>
}

export type AttestationFragment = {
  __typename?: 'Attestation'
  id: string
  attester: string
  recipient: string
  decodedDataJson: string
  timeCreated: number
  txid: string
}

export type EscrowDelegatesQueryVariables = Exact<{
  schemaId: Scalars['String']['input']
  recipient: Scalars['String']['input']
  attesters: Array<Scalars['String']['input']> | Scalars['String']['input']
}>

export type EscrowDelegatesQuery = {
  __typename?: 'Query'
  attestations: Array<{
    __typename?: 'Attestation'
    id: string
    attester: string
    recipient: string
    decodedDataJson: string
    timeCreated: number
    txid: string
  }>
}

export type PropdatesQueryVariables = Exact<{
  schemaId: Scalars['String']['input']
  recipient: Scalars['String']['input']
}>

export type PropdatesQuery = {
  __typename?: 'Query'
  attestations: Array<{
    __typename?: 'Attestation'
    id: string
    attester: string
    recipient: string
    decodedDataJson: string
    timeCreated: number
    txid: string
  }>
}

export const AttestationFragmentDoc = gql`
  fragment Attestation on Attestation {
    id
    attester
    recipient
    decodedDataJson
    timeCreated
    txid
  }
`
export const EscrowDelegatesDocument = gql`
  query escrowDelegates($schemaId: String!, $recipient: String!, $attesters: [String!]!) {
    attestations(
      where: {
        schemaId: { equals: $schemaId }
        recipient: { equals: $recipient }
        attester: { in: $attesters }
      }
    ) {
      ...Attestation
    }
  }
  ${AttestationFragmentDoc}
`
export const PropdatesDocument = gql`
  query propdates($schemaId: String!, $recipient: String!) {
    attestations(
      where: { schemaId: { equals: $schemaId }, recipient: { equals: $recipient } }
    ) {
      ...Attestation
    }
  }
  ${AttestationFragmentDoc}
`

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any,
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables,
) => action()

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
  return {
    escrowDelegates(
      variables: EscrowDelegatesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<EscrowDelegatesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<EscrowDelegatesQuery>(EscrowDelegatesDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'escrowDelegates',
        'query',
        variables,
      )
    },
    propdates(
      variables: PropdatesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<PropdatesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<PropdatesQuery>(PropdatesDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        'propdates',
        'query',
        variables,
      )
    },
  }
}
export type Sdk = ReturnType<typeof getSdk>
