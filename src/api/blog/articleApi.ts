import request from '@/utils/http'
import { ArticleInfoResult, ArticleRecordResult } from '@/types/blog/article'
import { CodeMsgResult } from '@/types/axios'

// 文章
export class ArticleService {
  // 查询文章列表
  static listArticle(query: any) {
    return request.get<ArticleRecordResult>({
      url: '/blog/article/admin',
      params: query
    })
  }

  // 查询文章详细
  static getArticle(id: any) {
    return request.get<ArticleInfoResult>({
      url: '/blog/article/admin/',
      params: id
    })
  }

  // 新增文章 修改文章
  static addOrUpdateArticle(data: any) {
    return request.post<CodeMsgResult>({
      url: '/blog/article/admin',
      data: data
    })
  }

  // 删除文章
  static deleteArticle(id: any) {
    return request.del<CodeMsgResult>({
      url: '/blog/article/' + id
    })
  }

  // 导出文章列表
  static exportExcel(data: any) {
    return request.post({
      url: 'blog/article/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }
}
