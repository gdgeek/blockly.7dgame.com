# 使用官方的Nginx镜像作为基础镜像
FROM nginx:alpine

# 删除默认的Nginx配置文件
RUN rm -rf /usr/share/nginx/html/*

# 将当前目录下的所有内容复制到容器的Nginx目录中
COPY . /usr/share/nginx/html

# 暴露80端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]