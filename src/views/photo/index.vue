<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>相册管理</span>
          <div class="operation-container">
            <el-button type="primary" @click="handleAdd" v-if="!isRecycle">新增相册</el-button>
            <div style="margin-left: auto">
              <el-input
                v-model="keywords"
                prefix-icon="Search"
                placeholder="请输入相册名"
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
              <el-button type="primary" :icon="Search" style="margin-left: 1rem" @click="handleSearch">
                搜索
              </el-button>
              <el-radio-group v-model="isRecycle" @change="handleRecycleChange" style="margin-left: 1rem">
                <el-radio-button :label="false">相册列表</el-radio-button>
                <el-radio-button :label="true">回收站</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>
      </template>

      <el-row class="album-container" :gutter="12" v-loading="loading">
        <el-empty v-if="albums.length === 0" description="暂无相册" />
        <el-col v-for="item of albums" :key="item.id" :md="6" :sm="8" :xs="12">
          <div class="album-item">
            <div class="album-operation">
              <el-dropdown trigger="click">
                <el-button type="primary" link :icon="More" circle />
                <template #dropdown>
                  <el-dropdown-menu>
                    <template v-if="!isRecycle">
                      <el-dropdown-item @click="handleEdit(item)">
                        <el-icon><Edit /></el-icon>编辑
                      </el-dropdown-item>
                      <el-dropdown-item @click="handleView(item)">
                        <el-icon><View /></el-icon>查看
                      </el-dropdown-item>
                      <el-dropdown-item @click="handleDelete(item.id!)" divided>
                        <el-icon><Delete /></el-icon>删除
                      </el-dropdown-item>
                    </template>
                    <template v-else>
                      <el-dropdown-item @click="handleRestore(item.id!)">
                        <el-icon><RefreshLeft /></el-icon>恢复
                      </el-dropdown-item>
                      <el-dropdown-item @click="handleDelete(item.id!)" divided>
                        <el-icon><Delete /></el-icon>彻底删除
                      </el-dropdown-item>
                    </template>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="album-photo-count">
              <span>{{ item.photoCount || 0 }}</span>
              <el-icon v-if="item.status === 2"><Lock /></el-icon>
            </div>
            <el-image
              class="album-cover"
              :src="item.albumCover"
              fit="cover"
              :preview-src-list="[item.albumCover]"
            />
            <div class="album-info">
              <div class="album-name">{{ item.albumName }}</div>
              <div class="album-desc">{{ item.albumDesc }}</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-pagination
        v-model:current-page="current"
        v-model:page-size="size"
        :total="count"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 添加或修改相册对话框 -->
    <el-dialog
      :title="title"
      v-model="addOrEdit"
      width="500px"
      append-to-body
    >
      <el-form
        ref="albumFormRef"
        :model="albumForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="相册名称" prop="albumName">
          <el-input v-model="albumForm.albumName" placeholder="请输入相册名称" />
        </el-form-item>
        <el-form-item label="相册描述" prop="albumDesc">
          <el-input
            v-model="albumForm.albumDesc"
            type="textarea"
            placeholder="请输入相册描述"
          />
        </el-form-item>
        <el-form-item label="相册封面">
          <el-upload
            class="upload-cover"
            drag
            action="/api/blog/photo/album/upload"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <template v-if="!albumForm.albumCover">
              <el-icon class="el-icon--upload"><Upload /></el-icon>
              <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
            </template>
            <template v-else>
              <img :src="albumForm.albumCover" class="upload-cover-preview" />
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="发布形式">
          <el-radio-group v-model="albumForm.status">
            <el-radio :label="1">公开</el-radio>
            <el-radio :label="2">私密</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addOrEdit = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="isdelete"
      title="提示"
      width="360px"
    >
      <div class="delete-confirm">
        <el-icon class="warning"><Warning /></el-icon>
        <span>确定要删除这个相册吗？</span>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isdelete = false">取 消</el-button>
          <el-button type="primary" @click="confirmDelete">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, More, Edit, View, Delete, Lock, Upload, Warning, RefreshLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import PhotoAlbumService from '@/api/photo/photoApi'
import type { PhotoAlbum } from '@/types/photo/photo'

// 遮罩层
const loading = ref(false)
// 相册列表数据
const albums = ref<PhotoAlbum[]>([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const addOrEdit = ref(false)
// 是否显示删除确认框
const isdelete = ref(false)
// 搜索关键词
const keywords = ref('')
// 待删除的相册ID
const deleteId = ref<number>()
// 是否为回收站模式
const isRecycle = ref(false)

// 分页参数
const current = ref(1)
const size = ref(10)
const count = ref(0)

// 表单参数
const albumForm = reactive<PhotoAlbum>({
  albumName: '',
  albumDesc: '',
  albumCover: '',
  status: 1
})

// 表单校验
const rules = reactive<FormRules>({
  albumName: [
    { required: true, message: '相册名称不能为空', trigger: 'blur' }
  ],
  albumDesc: [
    { required: true, message: '相册描述不能为空', trigger: 'blur' }
  ]
})

const albumFormRef = ref<FormInstance>()

/** 查询相册列表 */
const getList = async () => {
  loading.value = true
  try {
    const response = await PhotoAlbumService.listPhotoAlbum({
      pageNum: current.value,
      pageSize: size.value,
      keywords: keywords.value,
      isDelete: isRecycle.value ? 1 : 0
    })
    albums.value = response.rows
    count.value = response.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取相册列表失败')
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleSearch = () => {
  current.value = 1
  getList()
}

/** 新增按钮操作 */
const handleAdd = () => {
  title.value = '新增相册'
  albumForm.albumName = ''
  albumForm.albumDesc = ''
  albumForm.albumCover = ''
  albumForm.status = 1
  addOrEdit.value = true
}

/** 修改按钮操作 */
const handleEdit = async (row: PhotoAlbum) => {
  try {
    const response = await PhotoAlbumService.getPhotoAlbum(row.id!)
    Object.assign(albumForm, response.data)
    title.value = '修改相册'
    addOrEdit.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('获取相册详情失败')
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!albumFormRef.value) return
  
  await albumFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (albumForm.id) {
          await PhotoAlbumService.updatePhotoAlbum(albumForm)
          ElMessage.success('修改成功')
        } else {
          await PhotoAlbumService.addPhotoAlbum(albumForm)
          ElMessage.success('新增成功')
        }
        addOrEdit.value = false
        getList()
      } catch (error) {
        console.error(error)
        ElMessage.error(albumForm.id ? '修改失败' : '新增失败')
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = (id: number) => {
  deleteId.value = id
  isdelete.value = true
}

/** 确认删除 */
const confirmDelete = async () => {
  if (!deleteId.value) return
  
  try {
    await PhotoAlbumService.deletePhotoAlbum(deleteId.value)
    ElMessage.success(isRecycle.value ? '彻底删除成功' : '删除成功')
    isdelete.value = false
    getList()
  } catch (error) {
    console.error(error)
    ElMessage.error(isRecycle.value ? '彻底删除失败' : '删除失败')
  }
}

/** 恢复相册 */
const handleRestore = async (id: number) => {
  try {
    await PhotoAlbumService.restorePhotoAlbum(id)
    ElMessage.success('恢复成功')
    getList()
  } catch (error) {
    console.error(error)
    ElMessage.error('恢复失败')
  }
}

/** 切换回收站状态 */
const handleRecycleChange = () => {
  current.value = 1
  getList()
}

/** 查看相册 */
const handleView = (row: PhotoAlbum) => {
  // TODO: 实现查看相册详情的逻辑
}

/** 分页大小改变 */
const handleSizeChange = (val: number) => {
  size.value = val
  getList()
}

/** 分页页码改变 */
const handleCurrentChange = (val: number) => {
  current.value = val
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 24px;
  background-color: #f5f7fa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.operation-container {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.album-container {
  margin-top: 24px;
}

.album-item {
  position: relative;
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.album-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.album-operation {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.album-item:hover .album-operation {
  opacity: 1;
}

.album-photo-count {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.album-cover {
  width: 100%;
  height: 240px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.album-item:hover .album-cover {
  transform: scale(1.05);
}

.album-info {
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.album-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.album-desc {
  font-size: 14px;
  line-height: 1.5;
  color: #5c6b7c;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.upload-cover {
  width: 100%;
}

.upload-cover :deep(.el-upload) {
  width: 100%;
}

.upload-cover :deep(.el-upload-dragger) {
  width: 100%;
  height: 240px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.upload-cover :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}

.upload-cover-preview {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 8px;
}

.delete-confirm {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
}

.delete-confirm .warning {
  font-size: 28px;
  color: #ff9900;
}

.dialog-footer {
  text-align: right;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>