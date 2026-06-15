# 目录结构

```
yudao-ui-admin-vue3/
├── build/vite/              # Vite 插件与构建相关配置
├── public/                  # 静态资源（favicon、初始化 loading 动画等）
├── src/
│   ├── api/                 # 接口请求层（按业务模块划分，与后端模块对应）
│   │   ├── system/          # 系统功能接口（user、role、menu、dept...）
│   │   ├── infra/           # 基础设施接口（codegen、job、file...）
│   │   ├── bpm/             # 工作流接口
│   │   ├── pay/             # 支付接口
│   │   ├── mall/            # 商城接口
│   │   ├── crm/             # CRM 接口
│   │   ├── erp/             # ERP 接口
│   │   ├── ai/              # AI 大模型接口
│   │   ├── member/          # 会员接口
│   │   ├── zc/              # 【自研】窗帘业务核心模块（salesorder、customer、product、curtain...）
│   │   └── mes/             # 【自研】制造执行系统接口（工单、工序、质检等）
│   ├── assets/              # 本地静态资源（图片、SVG、字体）
│   ├── components/          # 全局公共组件（已自动注册）
│   │   ├── Form/            # 表单组件（SchemaForm 动态表单）
│   │   ├── Table/           # 表格组件（SchemaTable 动态表格）
│   │   ├── Dialog/          # 弹窗组件
│   │   ├── Editor/          # 富文本编辑器（WangEditor 封装）
│   │   ├── Upload/          # 文件/图片上传组件
│   │   ├── Icon/            # 图标选择器
│   │   ├── DictTag/         # 字典标签渲染组件
│   │   └── ...              # 其他业务组件
│   ├── hooks/               # 可复用的 Composition API Hooks
│   │   ├── web/             # 业务 Hooks（useCrudSchemas、useTable、useForm...）
│   │   └── event/           # 事件相关 Hooks
│   ├── layout/              # 布局组件（侧边栏、顶栏、标签页等）
│   ├── locales/             # 国际化语言包（zh-CN、en）
│   ├── router/              # 路由配置与动态路由守卫
│   │   ├── index.ts         # 路由实例与全局前置守卫
│   │   └── modules/         # 静态路由（Login、404 等）
│   ├── store/               # Pinia 状态管理
│   │   └── modules/
│   │       ├── user.ts      # 用户信息（token、权限、角色）
│   │       ├── permission.ts# 动态路由权限
│   │       ├── app.ts       # 全局应用配置（主题、折叠等）
│   │       ├── dict.ts      # 字典数据缓存
│   │       └── tagsView.ts  # 标签页状态
│   ├── styles/              # 全局样式（element-plus 主题覆盖、公共样式）
│   ├── utils/               # 工具函数
│   │   ├── axios/           # Axios 实例与拦截器封装
│   │   ├── auth.ts          # Token 存取（LocalStorage）
│   │   ├── dict.ts          # 字典工具函数
│   │   ├── routerHelper.ts  # 动态路由生成辅助
│   │   └── ...
│   └── views/               # 页面视图（与路由一一对应）
│       ├── Login/           # 登录页
│       ├── system/          # 系统管理页面
│       ├── infra/           # 基础设施页面
│       ├── bpm/             # 工作流页面
│       ├── pay/             # 支付页面
│       ├── mall/            # 商城页面
│       ├── crm/             # CRM 页面
│       ├── erp/             # ERP 页面
│       ├── ai/              # AI 大模型页面
│       ├── member/          # 会员中心页面
│       ├── mp/              # 微信公众号页面
│       ├── report/          # 数据报表页面
│       ├── zc/              # 【自研】窗帘业务核心页面（salesorder、customer、product...）
│       └── mes/             # 【自研】制造执行系统页面（cal、dv、md、pro、qc、tm、wm...）
├── types/                   # 全局 TypeScript 类型声明
├── .env                     # 公共环境变量
├── .env.dev                 # 开发环境（代理到本地后端）
├── .env.prod                # 生产环境
├── .env.test                # 测试环境
├── vite.config.ts           # Vite 配置（别名、代理、插件）
├── tsconfig.json            # TypeScript 配置
├── uno.config.ts            # UnoCSS 配置
└── package.json             # 依赖与脚本
```
