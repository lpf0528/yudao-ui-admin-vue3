# add-select

给指定 Vue 表单文件添加 el-select 下拉选择字段，并自动识别是否存在配套的列表页（index.vue），若存在则同步处理搜索栏筛选和表格列 ID 转义，同时避免重复请求 API。

## 接收参数（JSON 格式）

```json
{
  "file": "src/views/erp/.../XxxForm.vue",
  "apiImportPath": "@/api/erp/xxx/yyy",
  "apiClassName": "XxxApi",
  "apiMethod": "getXxxSimpleList",
  "voTypeName": "XxxVO",
  "fieldName": "xxxId",
  "label": "材质",
  "valueField": "id",
  "labelField": "value",
  "listVarName": "xxxList",
  "required": true,
  "validationMsg": "材质不能为空"
}
```

参数说明：
- `file`：目标 Vue 文件路径（相对于项目根目录）
- `apiImportPath`：API 模块 import 路径
- `apiClassName`：API 对象名（如 `ProductUnitApi`）
- `apiMethod`：获取列表的方法名（如 `getProductUnitSimpleList`）
- `voTypeName`：TypeScript 类型名（如 `ProductUnitVO`）
- `fieldName`：formData 中的字段名（如 `unitId`）
- `label`：表单项标签文字
- `valueField`：el-option 的 `:value` 绑定字段名（选中后保存的值）
- `labelField`：el-option 的 `:label` 绑定字段名（下拉展示的文字）
- `listVarName`：响应式列表变量名，留空时自动用 `{fieldName}List`
- `required`：是否必填，默认 `true`
- `validationMsg`：校验失败提示语

---

## 执行前：判断场景

读取目标 `XxxForm.vue` 后，**检查同目录下是否存在 `index.vue`**：

- **存在 index.vue** → 走「表单 + 列表页联动」流程（推荐，避免重复请求）
- **不存在 index.vue** → 走「仅表单」流程（API 请求在 `open()` 内）

---

## 场景 A：表单 + 列表页联动（存在 index.vue）

> 核心原则：API 只在 index.vue 的 `onMounted` 中请求一次，通过 prop 传给 Form，Form 不再自行请求。

### A-1：修改 XxxForm.vue

**步骤 1：import 只引入类型，不引入 API 对象**

在 import 区域末尾追加（已存在则跳过）：

```typescript
import { {voTypeName} } from '{apiImportPath}'
```

**步骤 2：用 defineProps 接收列表数据，不声明本地 ref**

在 `defineOptions` 之后添加：

```typescript
const props = defineProps<{ {listVarName}: {voTypeName}[] }>()
```

**步骤 3：open() 中不加载列表数据**（数据由父组件传入，无需任何改动）

**步骤 4：在 formData 初始值中添加字段**

```typescript
{fieldName}: undefined,
```

**步骤 5：在 formRules 中添加校验（required 为 true 时）**

```typescript
{fieldName}: [{ required: true, message: '{validationMsg}', trigger: 'blur' }],
```

**步骤 6：在 resetForm 中添加重置**

```typescript
{fieldName}: undefined,
```

**步骤 7：在模板中插入表单项，使用 `props.{listVarName}`**

```html
<el-col :span="12">
  <el-form-item label="{label}" prop="{fieldName}">
    <el-select v-model="formData.{fieldName}" clearable placeholder="请选择{label}" class="w-1/1">
      <el-option
        v-for="item in props.{listVarName}"
        :key="item.{valueField}"
        :label="item.{labelField}"
        :value="item.{valueField}"
      />
    </el-select>
  </el-form-item>
</el-col>
```

---

### A-2：修改 index.vue

**步骤 1：添加 import（API 对象 + 类型）**

```typescript
import { {apiClassName}, {voTypeName} } from '{apiImportPath}'
```

**步骤 2：添加列表变量和名称查找 computed**

在其他列表变量附近追加：

```typescript
const {listVarName} = ref<{voTypeName}[]>([]) // {label}列表
const {fieldName}Map = computed(() =>
  Object.fromEntries({listVarName}.value.map((item) => [item.{valueField}, item.{labelField}]))
)
```

**步骤 3：在 onMounted 中加载数据（改为 async）**

```typescript
onMounted(async () => {
  {listVarName}.value = await {apiClassName}.{apiMethod}()
  await getList()
})
```

**步骤 4：将 listVarName 通过 prop 传给 Form 组件**

```html
<XxxForm ref="formRef" :{listVarName}="{listVarName}" @success="getList" />
```

**步骤 5：修复搜索栏筛选下拉（若存在占位 el-option 则替换）**

找到 `prop="{fieldName}"` 的 `el-select`，将内部替换为：

```html
<el-option
  v-for="item in {listVarName}"
  :key="item.{valueField}"
  :label="item.{labelField}"
  :value="item.{valueField}"
/>
```

**步骤 6：修复表格列 ID 转义（若存在 `prop="{fieldName}"` 的 el-table-column）**

将：
```html
<el-table-column label="{label}" align="center" prop="{fieldName}" />
```
替换为：
```html
<el-table-column label="{label}" align="center" prop="{fieldName}">
  <template #default="scope">{{ {fieldName}Map[scope.row.{fieldName}] }}</template>
</el-table-column>
```

---

## 场景 B：仅表单（不存在 index.vue）

### 步骤 1：添加 import

```typescript
import { {apiClassName}, {voTypeName} } from '{apiImportPath}'
```

### 步骤 2：添加响应式列表变量

```typescript
const {listVarName} = ref<{voTypeName}[]>([]) // {label}列表
```

### 步骤 3：在 open() 中加载数据

```typescript
// {label}
{listVarName}.value = await {apiClassName}.{apiMethod}()
```

### 步骤 4：在 formData 初始值中添加字段

```typescript
{fieldName}: undefined,
```

### 步骤 5：在 formRules 中添加校验（required 为 true 时）

```typescript
{fieldName}: [{ required: true, message: '{validationMsg}', trigger: 'blur' }],
```

### 步骤 6：在 resetForm 中添加重置

```typescript
{fieldName}: undefined,
```

### 步骤 7：在模板中插入表单项

```html
<el-col :span="12">
  <el-form-item label="{label}" prop="{fieldName}">
    <el-select v-model="formData.{fieldName}" clearable placeholder="请选择{label}" class="w-1/1">
      <el-option
        v-for="item in {listVarName}"
        :key="item.{valueField}"
        :label="item.{labelField}"
        :value="item.{valueField}"
      />
    </el-select>
  </el-form-item>
</el-col>
```

---

## 参考实现

- **场景 A 表单**：`src/views/zc/customer/CustomerForm.vue`（logisticId 字段，通过 props.logisticsList 接收）
- **场景 A 列表页**：`src/views/zc/customer/index.vue`（logisticsList + logisticsMap，onMounted 加载，prop 传递）
- **场景 B**：`src/views/erp/product/product/ProductForm.vue` 第 36-46 行（unitId 字段）及第 135、174、195 行
