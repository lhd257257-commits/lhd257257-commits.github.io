# 一键推送作品集到 GitHub
# 用法（在 PowerShell 里）：
#   cd D:\作品\portfolio
#   .\push.ps1 你的用户名 仓库名
# 例：.\push.ps1 liuhaodong portfolio
#
# 前提：已在 GitHub 网页上创建好空仓库（不要勾选 README / .gitignore）。

param(
  [Parameter(Mandatory = $false)][string]$User,
  [Parameter(Mandatory = $false)][string]$Repo
)

$ErrorActionPreference = "Stop"

if (-not $User) { $User = Read-Host "GitHub 用户名" }
if (-not $Repo) {
  $Repo = Read-Host "仓库名（想用 用户名.github.io 就输入 $User.github.io）"
}

$remote = "https://github.com/$User/$Repo.git"
Write-Host "`n远程地址: $remote" -ForegroundColor Cyan

git remote remove origin 2>$null | Out-Null
git remote add origin $remote

Write-Host "`n开始推送（首次会弹出浏览器让你登录 GitHub）…`n" -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host "`n✅ 推送成功" -ForegroundColor Green
  if ($Repo -eq "$User.github.io") {
    Write-Host "网址: https://$User.github.io/" -ForegroundColor Green
    Write-Host "（GitHub Pages 一般 1–2 分钟生效）"
  } else {
    Write-Host "还要开一次 Pages：" -ForegroundColor Yellow
    Write-Host "  仓库 Settings → Pages → Source 选 Deploy from a branch → main / (root) → Save"
    Write-Host "网址: https://$User.github.io/$Repo/" -ForegroundColor Green
  }
}
