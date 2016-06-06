### mamahao-cloud-market-shop

#### 概述

妈妈好微商城系统（微信端），使用`nodejs`开发

#### 目录及文件说明

##### 服务器端

+ 服务器端相关的文件夹和文件
+ app目录,主要包括MVC三大部分
+ config目录，包括应用的配置信息，控制服务器的行为
+ server.js 应用入口

**server.js**

应用的入口，可以直接用node server.js启动
server.js的主要功能
+ 加载配置信息. 主要是应用本身的配置，认证和数据库连接的配置加载。
+ 加载模型. 遍历models目录下(包括子目录)中模型定义文件，并且加载。
+ 加载证书
+ 初始化Express应用
+ 配置Express应用
+ 配置Express路由信息
+ 在指定端口启动服务

**config目录**

配置文件都在这目录中。在env目录主要包括开发环境、生产环境已经测试模式的配置的信息。
其他的配置文件是对应用本身的配置，比如express的配置，登陆证书的配置等。

**app目录**

app都是服务器端的代码。为MVC创建的models，view和controllers三个目录，还有为了路由创建的文件夹routes。
includes目录包web应用页面的页眉页脚。layout目录是页面的布局文件，这个布局文件应会用到view目录下index.html。
users目录包含注册登陆的页面代码。
在views根目录，除了index.html还有404和500的页面。


##### 客户端
客户端的文件都在public目录下，css和img目录分别包含项目的样式文件和图片文件。
lib目录中可以放jquery、AngularJS等库文件的代码。


##### 测试
test目录包含了项目的测试代码，待定



#### 开发工具相关

1. IDE：webstorm，抛弃其他
2. 版本控制系统： git，抛弃svn
3. 单元测试： jsamine，前后端共用
4. 前端框架： angular、vue、backbone、react、react-native
5. 服务端： jade + REST
6. 异步流程控制：Promise是唯一选择，而且从一开始就要强制使用，绝不可忽略，这关系到设计思维的巨大差异，甚至关系到我们是否真正能够在node.js方向坚持下来。我们用Q.js，和前端Angular.js使用的微缩版Q.js保持一致，减少学习周期。

#### git常用命令

```bash
git clone git@github.com:mmrxia/mamahao-cloud-market-shop.git
```

```bash
git add .
```

```bash
git commit -m 'update file'
```

```bash
git push -u origin master
```

#### 历史版本 

+ v1.0(160602)


