import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

// 相册对象类型定义
export interface PhotoAlbumResult {
  id: number
  albumName: string
  albumDesc: string
  albumCover: string
  status: number
  photoCount?: number
  createTime?: string
}

export type PhotoAlbumListPageResult = BasePageResult<PhotoAlbumResult>
export type PhotoAlbumListResult = BaseArrayResult<PhotoAlbumResult>
export type PhotoAlbumInfoResult = BaseObjectResult<PhotoAlbumResult>
export type PhotoAlbumRecordResult = BaseRecordResult<PhotoAlbumResult>
