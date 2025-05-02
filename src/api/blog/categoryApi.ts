import request from '@/utils/http'
import { CategoryInfoResult,CategoryListPageResult } from '@/types/blog/category'
import { CodeMsgResult } from '@/types/axios'

// 分类
export class CategoryService {
    // 查询分类列表
    static listCategory(query: any) {
        return request.get<CategoryListPageResult>({
            url: '/blog/category/list',
            params: query
        })
    }

    // 查询分类详细
    static getCategory(id: any) {
        return request.get<CategoryInfoResult>({
            url: '/blog/category/' + id,
        })
    }

    // 新增分类
    static addCategory(data: any) {
        return request.post<CodeMsgResult>({
            url: '/blog/category',
            data: data
        })
    }

    // 修改分类
    static updateCategory(data: any) {
        return request.put<CodeMsgResult>({
            url: '/blog/category',
            data: data
        })
    }

    // 删除分类
    static deleteCategory(id: any) {
        return request.del<CodeMsgResult>({
            url: '/blog/category/' + id,
        })
    }

    // 导出分类列表
    static exportExcel(data: any) {
        return request.post({
            url: 'blog/category/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}