import request from '@/utils/http'
import {PhotoAlbumRecordResult} from "@/types/photo/photo";

// 相册
class PhotoAlbumService {

  // 获取相册列表
  static listPhotoAlbum(params: any) {
    return request.get<PhotoAlbumRecordResult>({
      url: '/blog/photo/admin/photos/albums',
      params
    })
  }

  // 新增或者修改相册
  static saveOrUpdatePhotoAlbum(data: any) {
    return request.post<PhotoAlbumRecordResult>({
      url: '/blog/photo/admin/photos/albums',
      data
    })
  }

  // 删除相册
  static deletePhotoAlbum(id: number) {
    return request.del<PhotoAlbumRecordResult>({
      url: `/blog/photo/admin/photos/albums/${id}`,
    })
  }
}

export default PhotoAlbumService
