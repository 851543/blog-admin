import request from '@/utils/http'
import { WebsiteInfoResult } from '@/types/website/website'
import { CodeMsgResult } from '@/types/axios'

// 网站
class WebsiteService {
  // 获取网站信息
  static getWebsiteInfo() {
    return request.get<WebsiteInfoResult>({
      url: '/admin/website/config'
    })
  }

  // 更新网站信息
  static updateWebsiteInfo(data: any) {
    return request.put<CodeMsgResult>({
      url: '/admin/website/config',
      data
    })
  }
}

export default WebsiteService
