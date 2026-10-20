# 小小成长家 · iOS 与安卓客户端

两个 App 使用同一份 `../frontend/` 界面，通过 HTTPS 调用服务器 API。界面打包在 App 内，账号、家庭关系、任务、积分与兑换数据均由服务器 MySQL 保存。采用 Capacitor 8 的原生容器，非 SwiftUI/Kotlin 分别重写的界面。

## 源码位置

| 位置 | 用途 |
| --- | --- |
| `../backend/` | 服务器业务接口、长期会话、数据库迁移 |
| `../frontend/` | 网页与手机端共用的界面 |
| `ios/App/App.xcodeproj` | iOS Xcode 工程 |
| `android/` | 安卓 Gradle / Android Studio 工程 |
| `src/transport.js` | 原生 HTTP、安全存储、前后台与返回键适配 |
| `src/client.js` | 登录恢复、退出、修改密码及错误处理 |
| `config.json` | 当前服务器地址，本机配置文件 |
| `config.example.json` | 配置模板，已填写 `https://hz.aihelps.cn` |
| `signing/` | 安卓签名资料，必须保密备份，不提交源码仓库 |

## 登录行为

- 首次登录后自动保存随机登录凭据；不保存账号密码。
- iOS 使用系统 Keychain，安卓使用 Android Keystore 加密存储；关闭、重开或正常升级 App 不会主动退出。
- 服务端会话没有时间截止；主动退出只撤销本设备，修改密码撤销所有旧会话并更新当前设备。
- 断网、超时和服务器临时错误不会删除凭据；恢复连接后可重试。
- 安卓卸载、清除应用数据、设备安全存储失效等情况需要重新登录。iOS Keychain 可能在卸载后保留，具体取决于系统行为。
- 网页使用 HttpOnly Cookie，每次有效访问续期 400 天；浏览器清理或限制 Cookie 后需要重新登录。
- 各端共用服务器数据，联网时刷新；未提供离线打卡、离线兑换和离线积分账本。

## 重新构建

需要 Node.js 22+。在 `mobile/` 执行：

```sh
npm ci
cp config.example.json config.json
npm run sync
```

已有 `config.json` 时不要覆盖。更换服务器需修改 `apiOrigin`，必须为完整 HTTPS 来源，不带 `/api` 路径。该值应与服务器 `PUBLIC_ORIGIN` 相同。

`npm run sync` 会构建共享界面、打包原生适配层，并同步到两个工程。修改界面或域名后必须再次同步，否则原生工程仍会包含上次打包内容。

### 安卓

当前工程使用 Java 21、Android SDK Platform 36、Gradle 8.14.3；最低 Android 7.0（API 24）。安装 Android Studio 后在 SDK Manager 安装平台 36，使用 JDK 21。可打开工程：

```sh
npm run open:android
```

命令行构建（先恢复本应用原来的 `signing/`）：

```sh
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

产物：`android/app/build/outputs/apk/release/app-release.apk`。

本次已建立独立的发布签名密钥。后续更新应始终使用这一把密钥，并递增 `android/app/build.gradle` 中的 `versionCode`；不要每次重新生成密钥，否则无法覆盖安装。签名文件不包含在公开源码压缩包中。没有签名资料时，发布构建会明确报错。

如仅做开发测试，可以运行 `./gradlew assembleDebug`。调试签名与正式签名不同，不能直接互相覆盖安装。

### iOS

需要完整 Xcode 26+，最低 iOS 15；使用 Swift Package Manager。当前机器缺少完整 Xcode，因此本次不包含 IPA 编译或 iPhone 真机验收。

```sh
npm run sync
npm run open:ios
```

在 Xcode 的 App → Signing & Capabilities 选择你的开发团队，并确认 Bundle Identifier。连接 iPhone 后运行；需要分发时使用 Product → Archive，按自己的 Apple 开发者账号支持的方式导出或上传。打包工程中的默认图标可在正式发布前替换为品牌图标。

## 验证

```sh
npm test
```

覆盖移动端 JS 构建、重新打开读取凭据、离线保留登录、旧凭据失效、修改密码替换和退出删除。自动测试使用模拟传输与存储，不等价于真机系统 Keychain / Keystore 测试；发布前应在目标手机完成注册、登录、重启、改密码及打卡验收。

技术参考：[Capacitor HTTP](https://capacitorjs.com/docs/apis/http)、[安全存储插件](https://github.com/aparajita/capacitor-secure-storage)、[Capacitor 环境要求](https://capacitorjs.com/docs/getting-started/environment-setup)。
