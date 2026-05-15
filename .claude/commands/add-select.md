# add-select

给指定 Vue 表单文件添加 el-select 下拉选择字段，复刻 ProductForm.vue 中"单位"字段（unitId）的实现模式。

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

## 执行步骤

收到 /add-select 指令后，按以下顺序修改目标文件（先 Read 读取，再逐步 Edit）：

### 步骤 1：添加 import

在 `<script setup>` 的 import 区域末尾追加（已存在则跳过）：

```typescript
import { {apiClassName}, {voTypeName} } from '{apiImportPath}'
```

### 步骤 2：添加响应式列表变量

在已有列表变量声明附近追加：

```typescript
const {listVarName} = ref<{voTypeName}[]>([]) // {label}列表
```

### 步骤 3：在 open() 中加载数据

在 `open()` 函数内，其他列表加载代码附近追加：

```typescript
// {label}
{listVarName}.value = await {apiClassName}.{apiMethod}()
```

### 步骤 4：在 formData 初始值中添加字段

在 `formData` 的 `ref({...})` 对象中添加：

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

找到合适的 `<el-col>` 位置，插入：

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

## 参考实现

`src/views/erp/product/product/ProductForm.vue` 第 36-46 行（unitId 字段）及第 135、174、195 行。
