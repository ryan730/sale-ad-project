使用方法：
1、拉取目录，执行 npm i 或 yarn install，安装 node_modules 包
2、执行 npm run init 或 yarn run init，创建项目目录
3、执行 npm run dll 或 yarn run dll，创建公共文件 dist/dll/bundle.dll.js，该文件需要手动引用到 html 中
4、执行 npm run build 或 yarn run build，创建 dist 目录
5、执行 npm run del 或 yarn run dev, 启动服务

注：
    1、第 3 步只需要在第一次时构建时执行即可，以后如果没有新增或删除过第三方库的话就不需要再执行了
    2、npm 与 yarn 不可以混用
    3、将 js, css, images 目录合并到 assets 目录中
    4、删除 js/pages 目录，将入口文件移动到 src 目录下的 main.js 和 main.vue
    5、将 webCompontents 目录，改为 modules 目录
    6、新增 src/units 目录( 公共组件 )，其中包含：core，CONFIG，widgets，components
    7、在启动服务之前，需要修改 views/pages/index.jade 中 script 引入的脚本；该脚本可以从生成的 dist/js/dll 中找 bundle.dll.xxxx.js
