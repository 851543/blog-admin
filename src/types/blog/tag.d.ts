import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface TagResult {
  id: string
  tagName: string
  createTime: string
  updateTime: string
}

export type TagListPageResult = BasePageResult<TagResult>
export type TagListResult = BaseArrayResult<TagResult>
export type TagInfoResult = BaseObjectResult<TagResult>
export type TagRecordResult = BaseRecordResult<TagResult>
