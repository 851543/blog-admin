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
              label="登录地址"
              prop="ipaddr"
              v-model="queryParams.ipaddr"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="用户名称"
              prop="userName"
              v-model="queryParams.userName"
              @keyup.enter="handleQuery"
            />
          </el-row>
        </el-form>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="onlineList"
      :total="total"
      :current-page="pageNum"
      :page-size="pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #default>
        <el-table-column label="序号" width="100px" type="index" align="center">
          <template #default="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="会话编号"
          align="center"
          prop="tokenId"
          :show-overflow-tooltip="true"
          v-if="columns[0].show"
        />
        <el-table-column
          label="登录名称"
          align="center"
          prop="userName"
          :show-overflow-tooltip="true"
          v-if="columns[1].show"
        />
        <el-table-column
          label="所属部门"
          align="center"
          prop="deptName"
          :show-overflow-tooltip="true"
          v-if="columns[2].show"
        />
        <el-table-column
          label="主机"
          align="center"
          prop="ipaddr"
          :show-overflow-tooltip="true"
          v-if="columns[3].show"
        />
        <el-table-column
          label="登录地点"
          align="center"
          prop="loginLocation"
          :show-overflow-tooltip="true"
          v-if="columns[4].show"
        />
        <el-table-column
          label="操作系统"
          align="center"
          prop="os"
          :show-overflow-tooltip="true"
          v-if="columns[5].show"
        />
        <el-table-column
          label="浏览器"
          align="center"
          prop="browser"
          :show-overflow-tooltip="true"
          v-if="columns[6].show"
        />
        <el-table-column
          label="登录时间"
          align="center"
          prop="loginTime"
          width="180"
          v-if="columns[7].show"
        />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="Delete"
              @click="handleForceLogout(scope.row)"
              v-auth="['monitor:online:forceLogout']"
              >强退</el-button
            >
          </template>
        </el-table-column>
      </template>
    </art-table>
  </div>
</template>

<script setup lang="ts">
  import { OnlineApi } from '@/api/monitor/onlineApi'
  import { OnlineResult } from '@/types/monitor/online'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'

  const onlineList = ref<OnlineResult[]>([])
  const loading = ref(true)
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)
  const queryRef = ref()

  const queryParams = reactive({
    ipaddr: '',
    userName: ''
  })

  const columns = reactive([
    { name: '会话编号', show: true },
    { name: '登录名称', show: true },
    { name: '所属部门', show: true },
    { name: '主机', show: true },
    { name: '登录地点', show: true },
    { name: '操作系统', show: true },
    { name: '浏览器', show: true },
    { name: '登录时间', show: true }
  ])

  const changeColumn = (list: any) => {
    columns.values = list
  }

  /** 查询在线用户列表 */
  const getList = async () => {
    loading.value = true
    const res = await OnlineApi.list(queryParams)
    if (res.code === 200) {
      onlineList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  /** 搜索按钮操作 */
  const handleQuery = () => {
    pageNum.value = 1
    getList()
  }

  /** 每页条数改变 */
  const handleSizeChange = (size: number) => {
    pageSize.value = size
    getList()
  }

  /** 当前页改变 */
  const handleCurrentChange = (page: number) => {
    pageNum.value = page
    getList()
  }

  /** 强退按钮操作 */
  const handleForceLogout = async (row: any) => {
    const Tr = await ElMessageBox.confirm('是否确认强退名称为"' + row.userName + '"的用户?')
    if (Tr) {
      const res = await OnlineApi.forceLogout(row.tokenId)
      if (res.code === 200) {
        ElMessage.success('强退成功')
        getList()
      }
    }
  }

  onMounted(() => {
    getList()
  })
</script>
