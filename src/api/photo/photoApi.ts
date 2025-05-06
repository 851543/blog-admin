import request from '@/utils/http'
import {PhotoAlbumRecordResult} from "@/types/photo/photo";

// 相册
class PhotoAlbumService {

  // 获取相册列表
  static listPhotoAlbum(params: any) {
    return request.get<PhotoAlbumRecordResult>({
      url: '/api/blog/photo/album/list',
      method: 'get',
      params
    })
  }

  // 获取相册详情
  static getPhotoAlbum(id: number) {
    return request.get<PhotoAlbumRecordResult>({
      url: `/api/blog/photo/album/${id}`,
      method: 'get'
    })
  }

  // 新增相册
  static addPhotoAlbum(data: any) {
    return request.post<PhotoAlbumRecordResult>({
      url: '/api/blog/photo/album',
      method: 'post',
      data 
    })  
  }

  // 修改相册
  static updatePhotoAlbum(data: any) {
    return request.put<PhotoAlbumRecordResult>({
      url: '/api/blog/photo/album',
      method: 'put',
      data
    })
  }

  // 删除相册
  static deletePhotoAlbum(id: number) {
    return request.del<PhotoAlbumRecordResult>({
      url: `/api/blog/photo/album/${id}`,
      params: {
        isDelete: 1
      }
    })
  }

  static restorePhotoAlbum(id: number) {
    return request.put<PhotoAlbumRecordResult>({
      url: `/api/blog/photo/album/${id}/restore`
    })
  }
}

export default PhotoAlbumService
