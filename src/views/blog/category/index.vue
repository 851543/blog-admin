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
                        <form-input label="分类名" prop="categoryName"
                                    v-model="queryParams.categoryName"
                                    @keyup.enter="handleQuery"/>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['blog:category:add']"
                   v-ripple>新增
        </el-button>
        <el-button @click="handleDelete" :disabled="multiple" v-auth="['blog:category:remove']"
                   v-ripple>删除
        </el-button>
        <el-button @click="handleExport" v-auth="['blog:category:export']"
                   v-ripple>导出
        </el-button>
      </template>
    </table-bar>


    <art-table
        v-loading="loading"
        :data="categoryList"
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
                <el-table-column label="分类名" align="center" prop="categoryName"
                                 v-if="columns[1].show"/>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <button-table
                type="edit"
                v-auth="['blog:category:edit']"
                @click="handleUpdate(scope.row)"
            />
            <button-table
                type="delete"
                v-auth="['blog:category:remove']"
                @click="handleDelete(scope.row)"
            />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="80px">
                        <el-form-item label="分类名" prop="categoryName">
                          <el-input v-model="form.categoryName" placeholder="请输入分类名"/>
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
  import {CategoryService} from "@/api/blog/categoryApi";
  import {ref, reactive} from 'vue'
  import {resetForm} from '@/utils/utils'
  import {ElMessage, ElMessageBox} from 'element-plus'
  import {FormInstance} from 'element-plus'
  import {CategoryResult} from '@/types/blog/category'
  const categoryList = ref<CategoryResult[]>([])
  const open = ref(false);
  const loading = ref(true);
  const ids = ref([]);
  const multiple = ref(true);
  const total = ref(0);
  const title = ref("");
  const queryRef = ref()
  const categoryRef = ref<FormInstance>()
  // 定义初始表单状态
  const initialFormState = {
                  id: null,
                  categoryName: null,
                  createTime: null,
                  updateTime: null
  }
  const form = reactive({...initialFormState})
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
                  categoryName: '',
  })
  const rules = reactive({
                  categoryName: [
              {
                required: true, message: "分类名不能为空", trigger: "blur" }
            ],
                  createTime: [
              {
                required: true, message: "创建时间不能为空", trigger: "blur" }
            ],
  })


  /** 查询分类列表 */
  const getList = async () => {
    loading.value = true;
    const res = await CategoryService.listCategory(queryParams)
    if (res.code === 200) {
            categoryList.value = res.rows;
      total.value = res.total;
      loading.value = false;
    }
  }

  const columns = reactive([
            {name: '$comment', show: true},
            {name: '分类名', show: true},
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
    title.value = "添加分类";
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset();
    const _id = row.id || ids.value
    const res = await CategoryService.getCategory(_id)
    if (res.code === 200) {
      Object.assign(form, res.data)
      open.value = true;
      title.value = "修改分类";
    }
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!categoryRef.value) return
    await categoryRef.value.validate(async (valid) => {
      if (valid) {
        if (form.id != null) {
          const res = await CategoryService.updateCategory(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false;
            getList();
          }
        } else {
          const res = await CategoryService.addCategory(form)
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
    const Tr = await ElMessageBox.confirm('是否确认删除分类编号为"' + _ids + '"的数据项？')
    if (Tr) {
      const res = await CategoryService.deleteCategory(_ids)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }


  import {downloadExcel} from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(CategoryService.exportExcel(queryParams))
  }

  // 初始化
  onMounted(() => {
    getList()
  })
</script>
