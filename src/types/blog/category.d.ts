import { BaseArrayResult, BaseObjectResult, BasePageResult, BaseRecordResult } from '../axios'

export interface CategoryResult {
  id: string
  categoryName: string
  createTime: string
  updateTime: string
}

export type CategoryListPageResult = BasePageResult<CategoryResult>
export type CategoryListResult = BaseArrayResult<CategoryResult>
export type CategoryInfoResult = BaseObjectResult<CategoryResult>
export type CategoryRecordResult = BaseRecordResult<CategoryResult>
