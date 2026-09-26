# MySQL5.7 部署说明

当前使用 `mysql:5.7`。

## 一、准备目录

数据库配置、数据和日志建议挂载到宿主机，方便备份和排查问题。

```sh
mkdir -p /data/at-1.6/mysql/config
mkdir -p /data/at-1.6/mysql/data
mkdir -p /data/at-1.6/mysql/logs
```

## 二、启动 MySQL 容器

把 `your-root-password` 替换成你自己的 root 密码。

```sh
docker run -d \
  --name at-1.6-mysql \
  -p 3306:3306 \
  -v /data/at-1.6/mysql/config:/etc/mysql/conf.d \
  -v /data/at-1.6/mysql/data:/var/lib/mysql \
  -v /data/at-1.6/mysql/logs:/var/log/mysql \
  -e MYSQL_ROOT_PASSWORD=your-root-password \
  mysql:5.7
```
