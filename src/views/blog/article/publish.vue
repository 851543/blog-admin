<template>
  <div class="article-edit">
    <div>
      <div class="editor-wrap">
        <!-- 文章标题、类型 -->
        <el-row :gutter="10">
          <el-col :span="18">
            <el-input
              v-model.trim="form.articleTitle"
              placeholder="请输入文章标题（最多100个字符）"
              maxlength="100"
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="form.type" placeholder="请选择文章类型" filterable>
              <el-option
                v-for="dict in articleType"
                :key="dict.value"
                :label="dict.label"
                :value="Number(dict.value)"
              />
            </el-select>
          </el-col>
        </el-row>

        <!-- 富文本编辑器 -->
        <Editor class="el-top" v-model="form.articleContent" />

        <div class="form-wrap">
          <h2>发布设置</h2>
          <!-- 图片上传 -->
          <el-form>
            <el-form-item label="封面">
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
                  <div v-if="!form.articleCover" class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <div class="upload-text">点击上传封面</div>
                  </div>
                  <img v-else :src="form.articleCover" class="cover-image" />
                </el-upload>
                <div class="el-upload__tip">建议尺寸 16:9，jpg/png 格式</div>
              </div>
            </el-form-item>
            <el-form-item label="文章分类">
              <el-tag
                type="success"
                v-show="form.categoryName"
                style="margin: 0 1rem 0 0"
                :closable="true"
                @close="removeCategory"
              >
                {{ form.categoryName }}
              </el-tag>
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                v-if="!form.categoryName"
              >
                <div class="popover-title">分类</div>
                <el-autocomplete
                  style="width: 100%"
                  v-model="categoryName"
                  :fetch-suggestions="searchCategories"
                  placeholder="请输入分类名搜索，enter可添加自定义分类"
                  :trigger-on-focus="false"
                  @keyup.enter.native="saveCategory"
                  @select="handleSelectCategories"
                >
                  <template #default="{ item }">
                    <div>{{ item.categoryName }}</div>
                  </template>
                </el-autocomplete>
                <div class="popover-container">
                  <div
                    v-for="item of categorys"
                    :key="item.id"
                    class="category-item"
                    @click="addCategory(item)"
                  >
                    {{ item.categoryName }}
                  </div>
                </div>
                <template #reference>
                  <el-button type="success" plain> 添加分类 </el-button>
                </template>
              </el-popover>
            </el-form-item>
            <el-form-item label="文章标签">
              <el-tag
                v-for="(item, index) of form.tagNames"
                :key="index"
                style="margin: 0 1rem 0 0"
                :closable="true"
                @close="removeTag(item)"
              >
                {{ item }}
              </el-tag>
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                v-if="form.tagNames.length < 3"
              >
                <div class="popover-title">标签</div>
                <el-autocomplete
                  style="width: 100%"
                  v-model="tagName"
                  :fetch-suggestions="searchTags"
                  placeholder="请输入标签名搜索，enter可添加自定义标签"
                  :trigger-on-focus="false"
                  @keyup.enter.native="saveTag"
                  @select="handleSelectTag"
                >
                  <template #default="{ item }">
                    <div>{{ item.tagName }}</div>
                  </template>
                </el-autocomplete>
                <div class="popover-container">
                  <div style="margin-bottom: 1rem">添加标签</div>
                  <el-tag
                    v-for="(item, index) of tagList"
                    :key="index"
                    :class="tagClass(item)"
                    @click="addTag(item)"
                  >
                    {{ item.tagName }}
                  </el-tag>
                </div>
                <template #reference>
                  <el-button type="primary" plain> 添加标签 </el-button>
                </template>
              </el-popover>
            </el-form-item>
            <el-form-item label="置顶">
              <el-switch
                v-model="form.isTop"
                active-color="#13ce66"
                inactive-color="#F4F4F5"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
            <el-form-item label="推荐">
              <el-switch
                v-model="form.isFeatured"
                active-color="#13ce66"
                inactive-color="#F4F4F5"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
            <el-form-item label="原文地址" v-if="form.type != 1">
              <el-input v-model="form.originalUrl" placeholder="请填写原文链接" />
            </el-form-item>
            <el-form-item label="发布形式">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">公开</el-radio>
                <el-radio :value="2">密码</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="访问密码" v-if="form.status == 2">
              <el-input v-model="form.password" placeholder="请填写文章访问密码" />
            </el-form-item>
            <el-form-item label="文章摘要">
              <el-input
                type="textarea"
                :autosize="true"
                v-model="form.articleAbstract"
                placeholder="默认取文章前500个字符"
              />
            </el-form-item>
          </el-form>
          <div style="display: flex; justify-content: flex-end">
            <el-button @click="saveArticleDraft" v-if="form.id == 0 || form.status == 3">
              保存
            </el-button>
            <el-button type="primary" @click="submit" style="width: 100px"> 发布 </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import EmojiText from '@/utils/emojo'
  import { ArticleService } from '@/api/blog/articleApi'
  import { CategoryService } from '@/api/blog/categoryApi'
  import { TagService } from '@/api/blog/tagApi'
  // 定义初始表单状态
  const initialFormState = {
    id: 0,
    articleTitle: '',
    articleContent: '',
    articleAbstract: '',
    articleCover: '',
    categoryName: null,
    tagNames: [] as string[],
    isTop: 0,
    isFeatured: 0,
    type: 1,
    status: 1,
    password: '',
    originalUrl: ''
  }
  const form = reactive({ ...initialFormState })
  const categoryName = ref('')
  const tagName = ref('')
  import { CategoryResult } from '@/types/blog/category'
  import { TagResult } from '@/types/blog/tag'
  const categorys = ref<CategoryResult[]>([])
  const tagList = ref<TagResult[]>([])

  const userStore = useUserStore()
  let { accessToken } = userStore

  // 上传路径
  const uploadImageUrl = `${import.meta.env.VITE_API_BASE_URL}/blog/article/admin/articles/images`
  // 传递 token
  const uploadHeaders = { Authorization: accessToken }

  // 获取文章类型
  import { useDict, DictType } from '@/utils/dict'
  const articleType = ref<DictType[]>([]) // 系统字典数据
  const getuseDict = async () => {
    const { article_type } = await useDict('article_type')
    articleType.value = article_type
  }

  // 上传成功后的处理函数
  const onSuccess = (response: any) => {
    form.articleCover = response.msg
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

  // 移除分类
  const removeCategory = () => {
    form.categoryName = null
  }

  // 搜索分类
  const searchCategories = (keywords: any, cb: any) => {
    CategoryService.searchCategories(keywords).then((res: any) => {
      cb(res.data)
    })
  }

  // 搜索标签
  const searchTags = (keywords: any, cb: any) => {
    TagService.searchTags(keywords).then((res: any) => {
      cb(res.data)
    })
  }

  // 保存分类
  const saveCategory = () => {
    if (categoryName.value.trim() != '') {
      addCategory({
        categoryName: categoryName
      })
      categoryName.value = ''
    }
  }

  // 添加分类
  const addCategory = (item: any) => {
    form.categoryName = item.categoryName
  }

  // 处理选择的分类
  const handleSelectCategories = (item: any) => {
    addCategory({
      categoryName: item.categoryName
    })
  }

  // 移除标签
  const removeTag = (item: any) => {
    const index = form.tagNames.indexOf(item)
    form.tagNames.splice(index, 1)
  }

  // 添加标签
  const addTag = (item: any) => {
    if (form.tagNames.indexOf(item.tagName) == -1) {
      form.tagNames.push(item.tagName)
    }
  }

  // 保存标签
  const saveTag = () => {
    if (tagName.value.trim() != '') {
      addTag({
        tagName: tagName.value
      })
      tagName.value = ''
    }
  }

  // 处理选择的标签
  const handleSelectTag = (item: any) => {
    addTag({
      tagName: item.tagName
    })
  }

  // 标签样式
  const tagClass = (item: any) => {
    return form.tagNames.indexOf(item.tagName) == -1 ? 'tag-item' : 'tag-item active'
  }

  // 列出分类
  const listCategories = async () => {
    const res = await CategoryService.searchCategories()
    if (res.code === 200) {
      categorys.value = res.data
    }
  }
  const listTags = async () => {
    const res = await TagService.searchTags()
    if (res.code === 200) {
      tagList.value = res.data
    }
  }

  // 验证输入
  const validateArticle = () => {
    if (form.articleTitle.trim() == '') {
      ElMessage.error(`文章标题不能为空`)
      return false
    }

    if (form.articleContent.trim() == '<p><br></p>') {
      ElMessage.error(`文章内容不能为空`)
      return false
    }

    if (form.categoryName == null) {
      ElMessage.error(`文章分类不能为空`)
      return false
    }

    if (form.tagNames.length == 0) {
      ElMessage.error(`文章标签不能为空`)
      return false
    }

    if (form.articleCover.trim() == '') {
      ElMessage.error(`文章封面不能为空`)
      return false
    }

    return true
  }

  const delCodeTrim = (content: string): string => {
    return content.replace(/(\s*)<\/code>/g, '</code>')
  }

  // 发布文章
  const submit = async () => {
    if (!validateArticle()) {
      return
    }
    form.articleContent = delCodeTrim(form.articleContent)
    const res = await ArticleService.addOrUpdateArticle(form)
    if (res.code === 200) {
      ElMessage.success(`${res.msg} ${EmojiText[200]}`)
      goBack()
    }
  }

  const saveArticleDraft = async () => {
    if (form.articleTitle.trim() == '') {
      ElMessage.error(`文章标题不能为空`)
      return
    }

    if (form.articleTitle.trim() == '') {
      ElMessage.error(`文章内容不能为空`)
      return
    }
    form.articleContent = delCodeTrim(form.articleContent)
    form.status = 3
    const res = await ArticleService.addOrUpdateArticle(form)
    if (res.code === 200) {
      ElMessage.success(`${res.msg} ${EmojiText[200]}`)
      goBack()
    }
  }

  import { useRouter } from 'vue-router'
  const router = useRouter()
  // 返回上一页
  const goBack = () => {
    setTimeout(() => {
      router.go(-1)
    }, 800)
  }

  import { useRoute } from 'vue-router'
  const route = useRoute()
  // 详细文章
  const getArticleDetail = async () => {
    form.id = Number(route.params && route.params.articleId)
    if (form.id == 0) {
      return
    }
    const res = await ArticleService.getArticle(form.id)
    if (res.code === 200) {
      res.data.status = res.data.status == '3' ? '1' : res.data.status
      Object.assign(form, res.data)
    }
  }

  onMounted(() => {
    getuseDict()
    listCategories()
    listTags()
    getArticleDetail()
  })
</script>

<style lang="scss" scoped>
  .article-edit {
    .editor-wrap {
      max-width: 1000px;
      margin: 20px auto;

      .el-top {
        margin-top: 10px;
      }

      .form-wrap {
        padding: 20px;
        margin-top: 20px;
        background-color: var(--art-main-bg-color);
        border: 1px solid var(--art-border-color);
        border-radius: calc(var(--custom-radius) / 2 + 2px) !important;

        h2 {
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 500;
        }
      }
    }

    .outline-wrap {
      box-sizing: border-box;
      width: 280px;
      padding: 20px;
      border: 1px solid #e3e3e3;
      border-radius: 8px;

      .item {
        p {
          height: 30px;
          font-size: 13px;
          line-height: 30px;
          cursor: pointer;
        }

        .level3 {
          padding-left: 10px;
        }
      }
    }

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
  }
  .article-title-container {
    display: flex;
    align-items: center;
    margin-bottom: 1.25rem;
    margin-top: 2.25rem;
  }
  .save-btn {
    margin-left: 0.75rem;
    background: #fff;
    color: #f56c6c;
  }
  .tag-item {
    margin-right: 1rem;
    margin-bottom: 1rem;
    cursor: pointer;
  }
  .tag-item-select {
    margin-right: 1rem;
    margin-bottom: 1rem;
    cursor: not-allowed;
    color: #ccccd8 !important;
  }
  .category-item {
    cursor: pointer;
    padding: 0.6rem 0.5rem;
  }
  .category-item:hover {
    background-color: #f0f9eb;
    color: #67c23a;
  }
  .popover-title {
    margin-bottom: 1rem;
    text-align: center;
  }
  .popover-container {
    margin-top: 1rem;
    height: 260px;
    overflow-y: auto;
  }
</style>
