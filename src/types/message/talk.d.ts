import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

// 后台说说
export interface TalkResult {
  id: number
  content: string
  images: string[]
  isTop: number
  status: number
  createTime: string
}

export type TalkListPageResult = BasePageResult<TalkResult>
export type TalkListResult = BaseArrayResult<TalkResult>
export type TalkInfoResult = BaseObjectResult<TalkResult>
export type TalkRecordResult = BaseRecordResult<TalkResult>
