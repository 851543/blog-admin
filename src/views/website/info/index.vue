<template>
  <el-card class="region art-custom-card">
    <el-tabs v-model="activeName">
      <el-tab-pane label="网站信息" name="info">
        <el-form label-width="100px" :model="websiteConfigForm" label-position="left">
          <el-form-item label="作者头像">
            <el-upload
              class="avatar-uploader"
              action="/api/admin/config/images"
              :headers="headers"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="handleAuthorAvatarSuccess"
            >
              <div v-if="!websiteConfigForm.authorAvatar" class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传头像</div>
              </div>
              <img v-else :src="websiteConfigForm.authorAvatar" class="avatar" />
            </el-upload>
          </el-form-item>
          <el-form-item label="网站logo">
            <el-upload
              class="avatar-uploader"
              action="/api/admin/config/images"
              :headers="headers"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="handleLogoSuccess"
            >
              <div v-if="!websiteConfigForm.logo" class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传Logo</div>
              </div>
              <img v-else :src="websiteConfigForm.logo" class="avatar" />
            </el-upload>
          </el-form-item>
          <el-form-item label="favicon">
            <el-upload
              class="avatar-uploader"
              action="/api/admin/config/images"
              :headers="headers"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="handleFaviconSuccess"
            >
              <div v-if="!websiteConfigForm.favicon" class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传图标</div>
              </div>
              <img v-else :src="websiteConfigForm.favicon" class="avatar" />
            </el-upload>
          </el-form-item>
          <form-input label="网站名称" prop="name" v-model="websiteConfigForm.name" />
          <form-input
            label="网站英文名称"
            prop="englishName"
            v-model="websiteConfigForm.englishName"
          />
          <form-input label="网站作者" prop="author" v-model="websiteConfigForm.author" />
          <form-input
            label="网页标题"
            prop="websiteTitle"
            v-model="websiteConfigForm.websiteTitle"
          />
          <form-input label="作者介绍" prop="authorIntro" v-model="websiteConfigForm.authorIntro" />
          <el-form-item label="多语言">
            <el-radio-group prop="multiLanguage" v-model="websiteConfigForm.multiLanguage">
              <el-radio
                v-for="dict in [
                  { label: '关闭', value: 0 },
                  { label: '开启', value: 1 }
                ]"
                :key="dict.value"
                :value="dict.value"
                >{{ dict.label }}</el-radio
              >
            </el-radio-group>
          </el-form-item>
          <el-form-item label="网站创建日期">
            <el-date-picker
              style="width: 400px"
              value-format="yyyy-MM-dd"
              v-model="websiteConfigForm.websiteCreateTime"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
          <form-input
            label="网站公告"
            prop="notice"
            v-model="websiteConfigForm.notice"
            type="textarea"
            :rows="5"
          />
          <form-input
            label="工信部备案号"
            prop="beianNumber"
            v-model="websiteConfigForm.beianNumber"
          />
          <form-input
            label="公安部备案号"
            prop="gonganBeianNumber"
            v-model="websiteConfigForm.gonganBeianNumber"
          />
          <el-form-item label="qq登录">
            <el-radio-group v-model="websiteConfigForm.qqLogin">
              <el-radio :label="0">关闭</el-radio>
              <el-radio :label="1">开启</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-button
            type="primary"
            size="medium"
            style="margin-left: 6.3rem"
            @click="updateWebsiteConfig"
          >
            修改
          </el-button>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="社交信息" name="notice">
        <el-form label-width="70px" :model="websiteConfigForm">
          <form-input label="Github" prop="github" v-model="websiteConfigForm.github" />
          <form-input label="Gitee" prop="gitee" v-model="websiteConfigForm.gitee" />
          <form-input label="QQ" prop="qq" v-model="websiteConfigForm.qq" />
          <form-input label="WeChat" prop="weChat" v-model="websiteConfigForm.weChat" />
          <form-input label="微博" prop="weibo" v-model="websiteConfigForm.weibo" />
          <form-input label="CSDN" prop="csdn" v-model="websiteConfigForm.csdn" />
          <form-input label="知乎" prop="zhihu" v-model="websiteConfigForm.zhihu" />
          <form-input label="掘金" prop="juejin" v-model="websiteConfigForm.juejin" />
          <form-input label="twitter" prop="twitter" v-model="websiteConfigForm.twitter" />
          <form-input
            label="stackoverflow"
            prop="stackoverflow"
            v-model="websiteConfigForm.stackoverflow"
          />
          <el-button
            type="primary"
            size="medium"
            style="margin-left: 4.375rem"
            @click="updateWebsiteConfig"
          >
            修改
          </el-button>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="其他设置" name="password">
        <el-form label-width="120px" :model="websiteConfigForm" label-position="left">
          <el-row style="width: 600px">
            <el-col :md="12">
              <el-form-item label="用户头像">
                <el-upload
                  class="avatar-uploader"
                  action="/api/admin/config/images"
                  :headers="headers"
                  :show-file-list="false"
                  :before-upload="beforeUpload"
                  :on-success="handleUserAvatarSuccess"
                >
                  <div v-if="!websiteConfigForm.userAvatar" class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <div class="upload-text">点击上传头像</div>
                  </div>
                  <img v-else :src="websiteConfigForm.userAvatar" class="avatar" />
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :md="12">
              <el-form-item label="游客头像">
                <el-upload
                  class="avatar-uploader"
                  action="/api/admin/config/images"
                  :headers="headers"
                  :show-file-list="false"
                  :before-upload="beforeUpload"
                  :on-success="handleTouristAvatarSuccess"
                >
                  <div v-if="!websiteConfigForm.touristAvatar" class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <div class="upload-text">点击上传头像</div>
                  </div>
                  <img v-else :src="websiteConfigForm.touristAvatar" class="avatar" />
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="邮箱通知">
            <el-radio-group v-model="websiteConfigForm.isEmailNotice">
              <el-radio :label="1">开启</el-radio>
              <el-radio :label="0">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="评论审核">
            <el-radio-group v-model="websiteConfigForm.isCommentReview">
              <el-radio :label="1">开启</el-radio>
              <el-radio :label="0">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="打赏状态">
            <el-radio-group v-model="websiteConfigForm.isReward">
              <el-radio :label="1">开启</el-radio>
              <el-radio :label="0">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-row style="width: 600px" v-show="websiteConfigForm.isReward == 1">
            <el-col :md="12">
              <el-form-item label="微信收款码">
                <el-upload
                  class="avatar-uploader"
                  action="/api/admin/config/images"
                  :headers="headers"
                  :show-file-list="false"
                  :before-upload="beforeUpload"
                  :on-success="handleWeiXinSuccess"
                >
                  <div v-if="!websiteConfigForm.weiXinQRCode" class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <div class="upload-text">点击上传收款码</div>
                  </div>
                  <img v-else :src="websiteConfigForm.weiXinQRCode" class="avatar" />

                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :md="12">
              <el-form-item label="支付宝收款码">
                <el-upload
                  class="avatar-uploader"
                  action="/api/admin/config/images"
                  :headers="headers"
                  :show-file-list="false"
                  :before-upload="beforeUpload"
                  :on-success="handleAlipaySuccess"
                >
                  <div v-if="!websiteConfigForm.alipayQRCode" class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <div class="upload-text">点击上传收款码</div>
                  </div>
                  <img v-else :src="websiteConfigForm.alipayQRCode" class="avatar" />

                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-button
            type="primary"
            size="medium"
            style="margin-left: 6.3rem"
            @click="updateWebsiteConfig"
          >
            修改
          </el-button>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  const websiteConfigForm = ref({})
  const activeName = ref('info')
  const headers = ref({ Authorization: 'Bearer ' + sessionStorage.getItem('token') })

  const getWebsiteConfig = () => {
    axios.get('/api/admin/website/config').then(({ data }) => {
      websiteConfigForm.value = data.data
    })
  }

  const handleAuthorAvatarSuccess = (response) => {
    websiteConfigForm.value.authorAvatar = response.data
  }

  const handleFaviconSuccess = (response) => {
    websiteConfigForm.value.favicon = response.data
  }

  const handleLogoSuccess = (response) => {
    websiteConfigForm.value.logo = response.data
  }

  const handleUserAvatarSuccess = (response) => {
    websiteConfigForm.value.userAvatar = response.data
  }

  const handleTouristAvatarSuccess = (response) => {
    websiteConfigForm.value.touristAvatar = response.data
  }

  const handleWeiXinSuccess = (response) => {
    websiteConfigForm.value.weiXinQRCode = response.data
  }

  const handleAlipaySuccess = (response) => {
    websiteConfigForm.value.alipayQRCode = response.data
  }

  const beforeUpload = (file) => {
    return new Promise((resolve) => {
      if (file.size / 1024 < config.UPLOAD_SIZE) {
        resolve(file)
      }
      imageConversion.compressAccurately(file, config.UPLOAD_SIZE).then((res) => {
        resolve(res)
      })
    })
  }

  const updateWebsiteConfig = () => {
    axios.put('/api/admin/website/config', websiteConfigForm.value).then(({ data }) => {
      if (data.flag) {
        this.$notify.success({
          title: '成功',
          message: data.message
        })
      } else {
        this.$notify.error({
          title: '失败',
          message: data.message
        })
      }
    })
  }

  onMounted(() => {
    getWebsiteConfig()
  })
</script>

<style lang="scss" scoped>
  .region {
    box-sizing: border-box;
    background: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) / 2 + 4px) !important;
  }
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 140px;
    height: 140px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    
    .upload-icon {
      font-size: 24px;
      color: #909399;
    }
    
    .upload-text {
      margin-top: 8px;
      font-size: 14px;
      color: #909399;
    }
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin: 10px 0;
    padding: 4px;
    background: #fafafa;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
    background: #f5f7fa;
  }
  .avatar-uploader-icon {
    font-size: 24px;
    color: #909399;
    width: 140px;
    height: 140px;
    line-height: 140px;
    text-align: center;
  }
  .avatar {
    width: 140px;
    height: 140px;
    display: block;
    object-fit: cover;
    padding: 4px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
  }
</style>
