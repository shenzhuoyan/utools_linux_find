# utools_linux_find
utools linux端第一个文件搜索插件

## 安装

1. 在utools插件商店搜索 “find for linux” 安装
2. 或在这里下载安装包，拖动安装包时打开utools窗口即可拖进去，点击安装

## 使用

请务必安装[fd-find](https://github.com/sharkdp/fd#installation)，Debian系安装方式:

```shell
sudo apt install fd-find
```

其他发行版自行安装

## 常用配置

- 配置文件在`.config/findlinux/find.sh`
- 设置fd-find的参数，修改配置文件中的`result`字符串。如指定目录为`~/笔记`、`~/Documents`、`~/Desktop`：
  ```shell
  result=$($cmd --search-path ~/笔记 --search-path ~/Documents --search-path ~/Desktop -Fa $1)
  ```
