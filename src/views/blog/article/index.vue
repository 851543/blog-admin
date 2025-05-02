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
                        <form-input label="作者" prop="userId"
                                    v-model="queryParams.userId"
                                    @keyup.enter="handleQuery"/>
                        <form-input label="文章分类" prop="categoryId"
                                    v-model="queryParams.categoryId"
                                    @keyup.enter="handleQuery"/>
                        <form-input label="标题" prop="articleTitle"
                                    v-model="queryParams.articleTitle"
                                    @keyup.enter="handleQuery"/>
                        <form-input label="是否置顶 0否 1是" prop="isTop"
                                    v-model="queryParams.isTop"
                                    @keyup.enter="handleQuery"/>
                        <form-input label="是否推荐 0否 1是" prop="isFeatured"
                                    v-model="queryParams.isFeatured"
                                    @keyup.enter="handleQuery"/>
                        <form-input label="是否删除  0否 1是" prop="isDelete"
                                    v-model="queryParams.isDelete"
                                    @keyup.enter="handleQuery"/>
                        <form-input label="访问密码" prop="password"
                                    v-model="queryParams.password"
                                    @keyup.enter="handleQuery"/>
                        <form-input label="原文链接" prop="originalUrl"
                                    v-model="queryParams.originalUrl"
                                    @keyup.enter="handleQuery"/>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['blog:article:add']"
                   v-ripple>新增
        </el-button>
        <el-button @click="handleDelete" :disabled="multiple" v-auth="['blog:article:remove']"
                   v-ripple>删除
        </el-button>
        <el-button @click="handleExport" v-auth="['blog:article:export']"
                   v-ripple>导出
        </el-button>
      </template>
    </table-bar>


    <art-table
        v-loading="loading"
        :data="articleList"
        selection
        :total="total"
        :current-page="queryParams.pageNum"
        :page-size="queryParams.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
        row-key="id"
    >
      <template #default>
                <el-table-column label="${comment}" align="center" prop="id"
                                 v-if="columns[0].show"/>
                <el-table-column label="作者" align="center" prop="userId"
                                 v-if="columns[1].show"/>
                <el-table-column label="文章分类" align="center" prop="categoryId"
                                 v-if="columns[2].show"/>
                <el-table-column label="文章缩略图" align="center" prop="articleCover"
                                 v-if="columns[3].show"/>
                <el-table-column label="标题" align="center" prop="articleTitle"
                                 v-if="columns[4].show"/>
                <el-table-column label="文章摘要，如果该字段为空，默认取文章的前500个字符作为摘要" align="center" prop="articleAbstract"
                                 v-if="columns[5].show"/>
                <el-table-column label="内容" align="center" prop="articleContent"
                                 v-if="columns[6].show"/>
                <el-table-column label="是否置顶 0否 1是" align="center" prop="isTop"
                                 v-if="columns[7].show"/>
                <el-table-column label="是否推荐 0否 1是" align="center" prop="isFeatured"
                                 v-if="columns[8].show"/>
                <el-table-column label="是否删除  0否 1是" align="center" prop="isDelete"
                                 v-if="columns[9].show"/>
                <el-table-column label="状态值 1公开 2私密 3草稿" align="center" prop="status"
                                 v-if="columns[10].show"/>
                <el-table-column label="文章类型 1原创 2转载 3翻译" align="center" prop="type"
                                 v-if="columns[11].show"/>
                <el-table-column label="访问密码" align="center" prop="password"
                                 v-if="columns[12].show"/>
                <el-table-column label="原文链接" align="center" prop="originalUrl"
                                 v-if="columns[13].show"/>
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

    <!-- 添加或修改文章对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="articleRef" :model="form" :rules="rules" label-width="80px">
                        <el-form-item label="作者" prop="userId">
                          <el-input v-model="form.userId" placeholder="请输入作者"/>
                        </el-form-item>
                        <el-form-item label="文章分类" prop="categoryId">
                          <el-input v-model="form.categoryId" placeholder="请输入文章分类"/>
                        </el-form-item>
                        <el-form-item label="文章缩略图" prop="articleCover">
                          <el-input v-model="form.articleCover" type="textarea" placeholder="请输入内容"/>
                        </el-form-item>
                        <el-form-item label="标题" prop="articleTitle">
                          <el-input v-model="form.articleTitle" placeholder="请输入标题"/>
                        </el-form-item>
                        <el-form-item label="文章摘要，如果该字段为空，默认取文章的前500个字符作为摘要" prop="articleAbstract">
                          <el-input v-model="form.articleAbstract" type="textarea" placeholder="请输入内容"/>
                        </el-form-item>
                        <el-form-item label="内容">
                          <editor v-model="form.articleContent" :min-height="192"/>
                        </el-form-item>
                        <el-form-item label="是否置顶 0否 1是" prop="isTop">
                          <el-input v-model="form.isTop" placeholder="请输入是否置顶 0否 1是"/>
                        </el-form-item>
                        <el-form-item label="是否推荐 0否 1是" prop="isFeatured">
                          <el-input v-model="form.isFeatured" placeholder="请输入是否推荐 0否 1是"/>
                        </el-form-item>
                        <el-form-item label="是否删除  0否 1是" prop="isDelete">
                          <el-input v-model="form.isDelete" placeholder="请输入是否删除  0否 1是"/>
                        </el-form-item>
                        <el-form-item label="访问密码" prop="password">
                          <el-input v-model="form.password" placeholder="请输入访问密码"/>
                        </el-form-item>
                        <el-form-item label="原文链接" prop="originalUrl">
                          <el-input v-model="form.originalUrl" placeholder="请输入原文链接"/>
                        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import {ArticleService} from "@/api/blog/articleApi";
  import {ref, reactive} from 'vue'
  import {resetForm} from '@/utils/utils'
  import {ElMessage, ElMessageBox} from 'element-plus'
  import {FormInstance} from 'element-plus'
  import {ArticleResult} from '@/types/blog/article'
  const articleList = ref<ArticleResult[]>([])
  const open = ref(false);
  const loading = ref(true);
  const ids = ref([]);
  const multiple = ref(true);
  const total = ref(0);
  const title = ref("");
  const queryRef = ref()
  const articleRef = ref<FormInstance>()
  // 定义初始表单状态
  const initialFormState = {
                  id: null,
                  userId: null,
                  categoryId: null,
                  articleCover: null,
                  articleTitle: null,
                  articleAbstract: null,
                  articleContent: null,
                  isTop: null,
                  isFeatured: null,
                  isDelete: null,
                  status: null,
                  type: null,
                  password: null,
                  originalUrl: null,
                  createTime: null,
                  updateTime: null
  }
  const form = reactive({...initialFormState})
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
                  userId: '',
                  categoryId: '',
                  articleCover: '',
                  articleTitle: '',
                  articleAbstract: '',
                  articleContent: '',
                  isTop: '',
                  isFeatured: '',
                  isDelete: '',
                  status: '',
                  type: '',
                  password: '',
                  originalUrl: '',
  })
  const rules = reactive({
                  userId: [
              {
                required: true, message: "作者不能为空", trigger: "blur" }
            ],
                  articleTitle: [
              {
                required: true, message: "标题不能为空", trigger: "blur" }
            ],
                  articleContent: [
              {
                required: true, message: "内容不能为空", trigger: "blur" }
            ],
                  isTop: [
              {
                required: true, message: "是否置顶 0否 1是不能为空", trigger: "blur" }
            ],
                  isFeatured: [
              {
                required: true, message: "是否推荐 0否 1是不能为空", trigger: "blur" }
            ],
                  isDelete: [
              {
                required: true, message: "是否删除  0否 1是不能为空", trigger: "blur" }
            ],
                  status: [
              {
                required: true, message: "状态值 1公开 2私密 3草稿不能为空", trigger: "change" }
            ],
                  type: [
              {
                required: true, message: "文章类型 1原创 2转载 3翻译不能为空", trigger: "change" }
            ],
                  createTime: [
              {
                required: true, message: "发表时间不能为空", trigger: "blur" }
            ],
  })


  /** 查询文章列表 */
  const getList = async () => {
    loading.value = true;
    const res = await ArticleService.listArticle(queryParams)
    if (res.code === 200) {
            articleList.value = res.rows;
      total.value = res.total;
      loading.value = false;
    }
  }

  const columns = reactive([
            {name: '$comment', show: true},
            {name: '作者', show: true},
            {name: '文章分类', show: true},
            {name: '文章缩略图', show: true},
            {name: '标题', show: true},
            {name: '文章摘要，如果该字段为空，默认取文章的前500个字符作为摘要', show: true},
            {name: '内容', show: true},
            {name: '是否置顶 0否 1是', show: true},
            {name: '是否推荐 0否 1是', show: true},
            {name: '是否删除  0否 1是', show: true},
            {name: '状态值 1公开 2私密 3草稿', show: true},
            {name: '文章类型 1原创 2转载 3翻译', show: true},
            {name: '访问密码', show: true},
            {name: '原文链接', show: true},
  ])

  const changeColumn = (list: any) => {
    columns.values = list
  }

  // 取消按钮
  const cancel = () => {
    open.value = false;
    reset();
  }

  // 表单重置
  const reset = () => {
    // 重置表单数据到初始状态
    Object.assign(form, initialFormState)
  }

  /** 搜索按钮操作 */
  const handleQuery = () => {
    queryParams.pageNum = 1;
    getList();
  }

  /** 每页条数改变 */
  const handleSizeChange = (size: number) => {
    queryParams.pageSize = size
    getList()
  }

  /** 当前页改变 */
  const handleCurrentChange = (page: number) => {
    queryParams.pageNum = page
    getList()
  }

  // 多选框选中数据
  const handleSelectionChange = (selection: any) => {
    ids.value = selection.map((item: any) => item.id);
    multiple.value = !selection.length;
  }

  /** 新增按钮操作 */
  const handleAdd = () => {
    reset();
    open.value = true;
    title.value = "添加文章";
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset();
    const _id = row.id || ids.value
    const res = await ArticleService.getArticle(_id)
    if (res.code === 200) {
      Object.assign(form, res.data)
      open.value = true;
      title.value = "修改文章";
    }
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!articleRef.value) return
    await articleRef.value.validate(async (valid) => {
      if (valid) {
        if (form.id != null) {
          const res = await ArticleService.updateArticle(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false;
            getList();
          }
        } else {
          const res = await ArticleService.addArticle(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false;
            getList();
          }
        }
      }
    });
  }

  /** 删除按钮操作 */
  const handleDelete = async (row: any) => {
    const _ids = row.id || ids.value;
    const Tr = await ElMessageBox.confirm('是否确认删除文章编号为"' + _ids + '"的数据项？')
    if (Tr) {
      const res = await ArticleService.deleteArticle(_ids)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }


  import {downloadExcel} from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(ArticleService.exportExcel(queryParams))
  }

  // 初始化
  onMounted(() => {
    getList()
  })
</script>
