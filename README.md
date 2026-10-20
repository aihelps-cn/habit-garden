# 小小成长家 v3 · 服务器 / iOS / 安卓

面向孩子与家长的习惯养成网站，使用 **Node.js 22 + MySQL 8.0 + Docker Compose**。前端和 API 由同一个应用服务提供，无需另外部署前端。

本版本提供服务器源码、共享界面及 iOS / 安卓工程；服务器使用 MySQL 保存数据。

请优先阅读 [服务器部署与安卓安装手册](deploy/服务器部署与安卓安装手册.md) 和 [手机端构建说明](mobile/README.md)。手机端服务器已配置为 `https://hz.aihelps.cn`，使用前须先更新服务器。

v3 默认保持登录：服务端会话不按日期过期，App 凭据使用系统加密存储，网页 Cookie 自动续期；主动退出、修改密码或清理应用数据仍可使登录失效。

## 已实现的功能

- 注册时选择「家长」或「孩子」，之后登录自动进入对应端。账号不能自行切换角色。
- 孩子生成一次性绑定码，家长输入绑定。一个孩子可绑定多个家长，一个家长也可管理多个孩子。
- 所有绑定家长都可设置该孩子的每日任务：名称、emoji 图标、分类、鼓励语和奖励积分。
- 孩子记录完成情况并填写说明，可主动提交审核，也可打开每天 22:00 自动提交。
- 打卡先保存、再提交、再审核。任意一位家长同意即可加分；驳回不会加分。
- 未审核记录到审核截止时间自动通过。自动任务在服务器运行，不依赖浏览器是否打开。
- 家长可自定义商城奖励和所需积分，支持冰淇淋、电视、活动和现金等奖励。
- 现金固定 **1 积分 = 1 元**，孩子可填整数金额。兑换立即扣分，家长支付/兑现后确认。
- 待兑现订单可由家长取消，退回积分。确认支付、取消退款不会重复扣分或退款。
- 家长可填写原因主动加减积分，不能扣成负数。
- 昵称、头像、密码修改，积分流水、审核记录和兑换记录。

## 审核与时间规则

业务时间固定为 **Asia/Shanghai，北京时间 UTC+8**；数据库内的 DATETIME 时间以 UTC 保存，不依赖服务器操作系统时区。

| 情况 | 处理规则 |
| --- | --- |
| 孩子点击「记录完成」 | 只记录，不立即加分；每个任务每天最多一条 |
| 主动提交 | 将该孩子全部待提交记录提交给已绑定家长 |
| 自动提交开启 | 每天 22:00 提交孩子已记录完成的内容，不生成未完成任务的记录 |
| 22:00～23:30 新记录完成 | 自动提交开启时，立即提交，截止当天 23:30 |
| 23:30 前提交 | 当天 23:30 仍未处理则自动通过 |
| 23:30 及以后提交 | 截止次日 23:30，给家长留出审核时间 |
| 任意家长通过 | 立即加分，其他家长看到处理结果，不再重复计分 |
| 家长驳回 | 保留原因，不自动加分；当天同任务不再重复打卡 |
| 尚未提交 | 孩子可以撤销，然后重新记录 |
| 任务积分被修改 | 已记录打卡保留当时的积分，新的打卡使用新积分 |
| 任务/奖励停用 | 不再产生新记录，已有审核、兑换与账本保留 |
| 服务停机后重启 | 补处理到期的自动提交和待审核记录；已处理记录不会重复加分 |

自动任务启动时执行一次，此后每 30 秒检查一次，正常情况下在指定时间后 30 秒内处理。大量积压时每轮最多提交 500 条、审核 500 条，逐轮补齐。关闭自动提交的孩子，其待提交记录不会自动进入审核。已提交记录仍然遵守自动通过规则。

家长审核和自动审核使用同一套状态检查；数据库事务、孩子账户行锁以及积分来源唯一约束防止并发重复入账。兑换和退分也在同一事务内更新余额及账本。余额上限为 10 亿，每次加减或现金兑换上限为 100 万。

## 在你的服务器上部署

准备 Linux 服务器，安装 Docker Engine 与 Docker Compose v2。把整个项目目录上传到服务器后执行：

```sh
cp .env.example .env
```

编辑 `.env`，至少修改：

```dotenv
PUBLIC_ORIGIN=https://你的实际域名
MYSQL_PASSWORD=独立的长随机应用数据库密码
MYSQL_ROOT_PASSWORD=另一个独立的长随机Root密码
```

`PUBLIC_ORIGIN` 必须与浏览器访问来源一致，包括协议和端口，不带路径。否则写入接口会拒绝跨来源请求。建议数据库密码采用长随机英文、数字与下划线，避免 `$` 引起 Compose 插值。

然后在服务器执行：

```sh
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 app
```

应用在 MySQL 健康后启动，并自动创建数据表。默认仅监听服务器的 `127.0.0.1:8080`，数据库不映射公网端口。配置 Nginx 等反向代理及 HTTPS 后访问域名。可参考 `deploy/nginx.conf.example`。

有且仅有一层可信 Nginx 代理、且应用端口仅对服务器本机开放时，可设置 `TRUST_PROXY=1`，让登录限流正确识别访问者 IP；直接访问时保持 `0`。`COOKIE_SECURE=true` 只适用于 HTTPS。

### 临时通过服务器 IP 和 HTTP 验收

如果暂未配置域名和 HTTPS，可将 `.env` 修改为：

```dotenv
PUBLIC_ORIGIN=http://服务器IP:8080
BIND_ADDRESS=0.0.0.0
APP_PORT=8080
COOKIE_SECURE=false
TRUST_PROXY=0
```

随后执行 `docker compose up -d --build`，并在防火墙中放行所需来源的 8080 端口。正式使用时建议恢复 HTTPS 和安全 Cookie。

### 首次使用

1. 分别注册家长账号、孩子账号。
2. 在孩子端「我的家庭」生成绑定码，复制给家长。绑定码有效 24 小时且仅能使用一次。
3. 家长端「我的家庭」输入绑定码；如需绑定另一位家长，由孩子再生成一个绑定码。
4. 家长选择孩子，在「任务与奖励」添加每日任务与商城奖励。
5. 孩子记录完成并提交，家长在「审核打卡」通过后获得积分，再到商店兑换。

初始余额为 0，没有演示交易，也没有内置默认管理员账号。邀请码只应分享给希望授权的家长。绑定后的所有家长具有相同管理权限。本版不含邮箱/短信找回密码或自助解绑功能，服务器管理员可通过数据库运维处理异常账户。

## 更新、持久化与备份

`mysql_data` 命名卷保存全部账号和业务数据。容器重建不会清空数据。不要执行 `docker compose down -v`，它会删除数据库数据卷。

更新源文件后：

```sh
docker compose up -d --build
```

在服务器生成数据库备份：

```sh
mkdir -p backups
docker compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqldump --single-transaction --no-tablespaces --set-gtid-purged=OFF -u habit habit_garden' > backups/habit-garden.sql
```

备份包含账号及业务资料，妥善存放。恢复前先备份当前数据，并在维护窗口停止应用，防止并发写入：

```sh
docker compose stop app
docker compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysql -u habit habit_garden' < backups/habit-garden.sql
docker compose start app
```

第一次初始化数据库卷后，修改 `.env` 的数据库密码不会自动修改 MySQL 内已有用户密码；应在数据库内同步修改后再更新应用配置。

旧版数据保留在原浏览器/原网址的 localStorage，新的自部署网址不会读取它。旧版可导出的 JSON 可留作备份，但本版不直接导入未经审核的旧积分。

## 验证方式

开发依赖只用于测试，不进入生产镜像。

```sh
npm ci
npm run build
npm run check
npm test
```

以上检查不启动应用或数据库。离线页面测试 `npm run test:ui` 使用 Playwright 浏览器，将页面资源和接口响应拦截到内存，不启动服务；可通过 `CHROME_PATH` 指定已有 Chrome，或在测试机器上准备 Playwright Chromium。

### 在服务器执行真实 MySQL 8.0 集成测试

测试项目使用独立数据库、临时存储，不连接生产数据库：

```sh
docker compose -f compose.test.yaml up --build --abort-on-container-exit --exit-code-from tests
docker compose -f compose.test.yaml down
```

覆盖：注册登录、绑定多个家长、权限隔离、重复打卡、积分快照、并发审核只加一次、22:00 提交、23:30 自动通过、晚提交、停机补偿、关闭自动提交、现金 1:1、并发兑换不超扣、取消只退款一次、加减积分与幂等重试。

按交付要求，开发阶段未在本机启动 MySQL 或应用容器，**真实 MySQL 集成测试和生产 Docker 镜像运行尚待服务器验收**。本机已执行 JavaScript 语法检查、纯逻辑测试、Compose 配置解析和离线页面交互测试。

## 文件说明

- `backend/schema.sql`：MySQL 8.0 表结构；启动时幂等建表。
- `backend/app.mjs`：账号、家庭、任务、审核、奖励与账本 API。
- `backend/domain.mjs`：事务、积分与自动审核逻辑。
- `backend/time.mjs`：北京时间与截止时间计算。
- `frontend/`：共享界面源码；`npm run build` 复制到 `dist/`，Docker 构建直接使用源码。
- `backend/auth.mjs`：长期会话、浏览器 Cookie 和手机 Bearer 认证。
- `mobile/ios/` / `mobile/android/`：手机原生工程；共用界面和服务器。
- `dist/`：网页交付产物。
- `server.mjs`：HTTP 服务、后台定时检查及优雅退出。
- `compose.yaml` / `Dockerfile`：生产部署。
- `compose.test.yaml` / `Dockerfile.test`：独立 MySQL 集成验收。

Sites 托管配置已从这份源码中移除，本次不会同步或部署到原 Sites 网址。此前已发布的私人网站并不会因为删除本地配置而下线；当前 Sites 工具没有取消发布接口，需由你在该平台的管理界面处理旧网站。
