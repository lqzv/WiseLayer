# API 文档发布说明

## 本地生成

```bash
npm install
npm run docs:api
```

打开 `docs-api/index.html` 预览。

## GitHub Pages 自动发布

1. 将代码推送到 GitHub 仓库
2. 进入仓库 **Settings → Pages**
3. **Build and deployment → Source** 选择 **GitHub Actions**
4. 向 `main` 或 `master` 分支推送代码，或手动触发 **Deploy API Docs** workflow

发布完成后，访问地址一般为：

```
https://<你的用户名>.github.io/WiseLayer/
```

可在 Actions 运行记录的 **Deploy to GitHub Pages** 步骤中查看实际 URL。

## 配置文件

| 文件 | 说明 |
|------|------|
| `typedoc.json` | TypeDoc 配置（入口、输出目录、中文 UI） |
| `.github/workflows/docs.yml` | GitHub Pages 部署 workflow |

生成目录 `docs-api/` 已加入 `.gitignore`，不提交到仓库，由 CI 在部署时生成。
