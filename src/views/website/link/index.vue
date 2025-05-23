<template>
  <div class="page-content">
    <el-row>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-form :model="queryParams" ref="queryRef">
          <el-input
            placeholder="请输入友链名称"
            v-model="queryParams.keywords"
            @keyup.enter="handleQuery"
          />
        </el-form>
      </el-col>
      <div style="width: 12px"></div>
      <el-col :xs="24" :sm="12" :lg="6" class="el-col2">
        <el-button @click="handleQuery" v-ripple>搜索 </el-button>
        <el-button @click="handleAdd" v-auth="['server:tag:add']" v-ripple>新增 </el-button>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['server:tag:remove']"
          v-ripple
          >删除
        </el-button>
      </el-col>
    </el-row>

    <art-table
      v-loading="loading"
      :data="linkList"
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
        <el-table-column label="链接名" align="center" prop="linkName" />
        <el-table-column label="链接头像" align="center" prop="linkAvatar">
          <template #default="scope">
            <el-image
              class="article-cover"
              :src="scope.row.linkAvatar ? scope.row.linkAvatar : defaultAvatar"
            />
          </template>
        </el-table-column>
        <el-table-column label="链接地址" align="center" prop="linkAddress" />
        <el-table-column label="链接介绍" align="center" prop="linkIntro" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <button-table
              type="edit"
              v-auth="['website:link:edit']"
              @click="handleUpdate(scope.row)"
            />
            <button-table
              type="delete"
              v-auth="['website:link:remove']"
              @click="handleDelete(scope.row)"
            />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改友链管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="linkRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="链接名" prop="linkName">
          <el-input v-model="form.linkName" placeholder="请输入链接名" />
        </el-form-item>
        <el-form-item label="链接头像" prop="linkAvatar">
          <div class="el-top upload-container">
            <el-upload
              class="cover-uploader"
              :action="uploadImageUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="onSuccess"
              :on-error="onError"
              :before-upload="beforeUpload"
            >
              <div v-if="!form.linkAvatar" class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传封面</div>
              </div>
              <img v-else :src="form.linkAvatar" class="cover-image" />
            </el-upload>
            <div class="el-upload__tip">建议尺寸 16:9，jpg/png 格式</div>
          </div>
        </el-form-item>
        <el-form-item label="链接地址" prop="linkAddress">
          <el-input v-model="form.linkAddress" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="链接介绍" prop="linkIntro">
          <el-input v-model="form.linkIntro" placeholder="请输入链接介绍" />
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
  import { FriendLinkService } from '@/api/website/linkApi'
  import { ref, reactive } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { FormInstance } from 'element-plus'
  import { FriendLinkResult } from '@/types/website/link'
  import { useUserStore } from '@/store/modules/user'
  import EmojiText from '@/utils/emojo'
  import defaultAvatar from '@/assets/images/defaultAvatar.png'
  import { Plus } from '@element-plus/icons-vue'
  const linkList = ref<FriendLinkResult[]>([])
  const open = ref(false)
  const loading = ref(true)
  const ids = ref([])
  const multiple = ref(true)
  const total = ref(0)
  const title = ref('')
  const queryRef = ref()
  const linkRef = ref<FormInstance>()
  const userStore = useUserStore()
  let { accessToken } = userStore
  // 上传路径
  const uploadImageUrl = `${import.meta.env.VITE_API_BASE_URL}/blog/article/admin/articles/images`
  // 传递 token
  const uploadHeaders = { Authorization: accessToken }
  // 定义初始表单状态
  const initialFormState = {
    id: null,
    linkName: null,
    linkAvatar: null,
    linkAddress: null,
    linkIntro: null
  }
  const form = reactive({ ...initialFormState })
  const queryParams = reactive({
    current: 1,
    size: 10,
    keywords: ''
  })
  const rules = reactive({
    linkName: [
      {
        required: true,
        message: '链接名不能为空',
        trigger: 'blur'
      }
    ],
    linkAvatar: [
      {
        required: true,
        message: '链接头像不能为空',
        trigger: 'blur'
      }
    ],
    linkAddress: [
      {
        required: true,
        message: '链接地址不能为空',
        trigger: 'blur'
      }
    ],
    linkIntro: [
      {
        required: true,
        message: '链接介绍不能为空',
        trigger: 'blur'
      }
    ]
  })

  /** 查询友链管理列表 */
  const getList = async () => {
    loading.value = true
    const res = await FriendLinkService.listLink(queryParams)
    if (res.code === 200) {
      linkList.value = res.data.records
      total.value = res.data.count
      loading.value = false
    }
  }

  // 上传成功后的处理函数
  const onSuccess = (response: any) => {
    form.linkAvatar = response.msg
    ElMessage.success(`图片上传成功 ${EmojiText[200]}`)
  }

  // 上传失败后的处理函数
  const onError = () => {
    ElMessage.error(`图片上传失败 ${EmojiText[500]}`)
  }

  // 上传前的校验函数
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return false
    }
    if (!isLt2M) {
      ElMessage.error('图片大小不能超过 2MB!')
      return false
    }
    return true
  }

  // 取消按钮
  const cancel = () => {
    open.value = false
    reset()
  }

  // 表单重置
  const reset = () => {
    // 重置表单数据到初始状态
    Object.assign(form, initialFormState)
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

  /** 新增按钮操作 */
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = '添加友链管理'
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset()
    Object.assign(form, row)
    open.value = true
    title.value = '修改友链管理'
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!linkRef.value) return
    await linkRef.value.validate(async (valid) => {
      if (valid) {
        const res = await FriendLinkService.addOrUpdateLink(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      }
    })
  }

  /** 删除按钮操作 */
  const handleDelete = async (row: any) => {
    const _ids = row.id ? [row.id] : ids.value
    const Tr = await ElMessageBox.confirm('是否确认删除友链管理编号为"' + _ids + '"的数据项？')
    if (Tr) {
      const res = await FriendLinkService.deleteLink(_ids)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  // 初始化
  onMounted(() => {
    getList()
  })
</script>
<style lang="scss" scoped>
  .upload-container {
    .cover-uploader {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border-radius: 6px;
      transition: var(--el-transition-duration);

      &:hover {
        border-color: var(--el-color-primary);
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 260px;
        height: 160px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;

        .upload-icon {
          font-size: 28px;
          color: #8c939d;
        }

        .upload-text {
          margin-top: 8px;
          font-size: 14px;
          color: #8c939d;
        }
      }

      .cover-image {
        display: block;
        width: 260px;
        height: 160px;
        object-fit: cover;
      }
    }

    .el-upload__tip {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
    }
  }
  .article-cover {
    position: relative;
    width: 100%;
    height: 90px;
    border-radius: 4px;
  }
</style>
