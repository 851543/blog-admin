<template>
  <div class="page-content">
    <table-bar
      :showTop="false"
      @search="handleQuery"
      @reset="resetForm(queryRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="queryRef" label-width="82px">
          <el-row :gutter="20">
            <form-input
              label="文章标题"
              prop="articleTitle"
              v-model="queryParams.articleTitle"
              @keyup.enter="handleQuery"
            />
            <form-select
              label="文章分类"
              prop="categoryId"
              v-model="queryParams.status"
              :options="sysNormalDisable"
              @keyup.enter="handleQuery"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['blog:article:add']" v-ripple>新增 </el-button>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['blog:article:remove']"
          v-ripple
          >删除
        </el-button>
        <el-button @click="handleExport" v-auth="['blog:article:export']" v-ripple>导出 </el-button>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="articleList"
      selection
      :total="total"
      :current-page="queryParams.current"
      :page-size="queryParams.size"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      row-key="id"
    >
      <template #default>
        <el-table-column label="文章作者" align="center" prop="userId" v-if="columns[0].show" />
        <el-table-column label="文章分类" align="center" prop="categoryId" v-if="columns[1].show" />
        <el-table-column label="缩略图" align="center" prop="articleCover" v-if="columns[2].show" />
        <el-table-column
          label="文章标题"
          align="center"
          prop="articleTitle"
          v-if="columns[3].show"
        />
        <el-table-column
          label="摘要"
          align="center"
          prop="articleAbstract"
          v-if="columns[4].show"
        />
        <el-table-column
          label="文章内容"
          align="center"
          prop="articleContent"
          v-if="columns[5].show"
        />
        <el-table-column label="置顶" align="center" prop="isTop" v-if="columns[6].show" />
        <el-table-column label="推荐" align="center" prop="isFeatured" v-if="columns[7].show" />
        <el-table-column label="删除" align="center" prop="isDelete" v-if="columns[8].show" />
        <el-table-column label="状态" align="center" prop="status" v-if="columns[9].show" />
        <el-table-column label="类型" align="center" prop="type" v-if="columns[10].show" />
        <el-table-column label="访问密码" align="center" prop="password" v-if="columns[11].show" />
        <el-table-column
          label="原文链接"
          align="center"
          prop="originalUrl"
          v-if="columns[12].show"
        />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <button-table
              type="edit"
              v-auth="['blog:article:edit']"
              @click="handleUpdate(scope.row)"
            />
            <button-table
              type="delete"
              v-auth="['blog:article:remove']"
              @click="handleDelete(scope.row)"
            />
          </template>
        </el-table-column>
      </template>
    </art-table>
  </div>
</template>

<script setup lang="ts">
  import { ArticleService } from '@/api/blog/articleApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArticleResult } from '@/types/blog/article'
  import { CategoryService } from '@/api/blog/categoryApi'
  import { TagService } from '@/api/blog/tagApi'
  const articleList = ref<ArticleResult[]>([])
  const loading = ref(true)
  const ids = ref([])
  const multiple = ref(true)
  const total = ref(0)
  const queryRef = ref()
  const queryParams = reactive({
    current: 1,
    size: 10,
    userId: '',
    categoryId: '',
    articleCover: '',
    articleTitle: '',
    articleAbstract: '',
    articleContent: '',
    isTop: '',
    isFeatured: '',
    isDelete: '0',
    status: '',
    type: '',
    password: '',
    originalUrl: ''
  })

  /** 查询文章列表 */
  const getList = async () => {
    loading.value = true
    const res = await ArticleService.listArticle(queryParams)
    if (res.code === 200) {
      articleList.value = res.data.records
      total.value = res.data.count
      loading.value = false
    }
  }

  const columns = reactive([
    { name: '文章作者', show: false },
    { name: '文章分类', show: false },
    { name: '缩略图', show: true },
    { name: '文章标题', show: true },
    { name: '摘要', show: true },
    { name: '文章内容', show: true },
    { name: '置顶', show: true },
    { name: '推荐', show: true },
    { name: '删除', show: true },
    { name: '状态', show: true },
    { name: '类型', show: true },
    { name: '访问密码', show: true },
    { name: '原文链接', show: true }
  ])

  const changeColumn = (list: any) => {
    columns.values = list
  }

  /** 搜索按钮操作 */
  const handleQuery = () => {
    queryParams.current = 1
    getList()
  }

  /** 每页条数改变 */
  const handleSizeChange = (size: number) => {
    queryParams.size = size
    getList()
  }

  /** 当前页改变 */
  const handleCurrentChange = (page: number) => {
    queryParams.current = page
    getList()
  }

  // 多选框选中数据
  const handleSelectionChange = (selection: any) => {
    ids.value = selection.map((item: any) => item.id)
    multiple.value = !selection.length
  }

  import { useRouter } from 'vue-router'
  const router = useRouter()
  /** 新增按钮操作 */
  const handleAdd = () => {
    router.push('/blog/article-publish/index/0')
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    router.push('/blog/article-publish/index/' + row.id)
  }

  /** 删除按钮操作 */
  const handleDelete = async (row: any) => {
    const _ids = row.id || ids.value
    const Tr = await ElMessageBox.confirm('是否确认删除文章编号为"' + _ids + '"的数据项？')
    if (Tr) {
      const res = await ArticleService.deleteArticle(_ids)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  // 文章分类
  const categoryOption = ref([])
  const searchCategories = async () => {
    const res = await CategoryService.searchCategories()
    if (res.code === 200) {
      categoryOption.value = res.data
    }
  }

  import { downloadExcel } from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(ArticleService.exportExcel(queryParams))
  }

  // 初始化
  onMounted(() => {
    getList()
  })
</script>
